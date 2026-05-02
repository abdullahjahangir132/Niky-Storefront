import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, productsTable } from "@workspace/db";
import { eq, avg, count, sql } from "drizzle-orm";

const router = Router();

// GET /api/products/:id/reviews
router.get("/products/:id/reviews", async (req, res) => {
  const productId = parseInt(req.params.id);

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, productId))
    .orderBy(sql`${reviewsTable.createdAt} DESC`);

  const [stats] = await db
    .select({
      avg: avg(reviewsTable.rating),
      count: count(),
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, productId));

  res.json({
    reviews: reviews.map(r => ({
      id: r.id,
      productId: r.productId,
      reviewerName: r.reviewerName,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedPurchase: r.isVerifiedPurchase,
      createdAt: r.createdAt.toISOString(),
    })),
    averageRating: Number(stats.avg ?? 0),
    totalReviews: Number(stats.count ?? 0),
  });
});

// POST /api/products/:id/reviews
router.post("/products/:id/reviews", async (req, res) => {
  const productId = parseInt(req.params.id);
  const { reviewerName, reviewerEmail = "", rating, title = "", comment } = req.body;

  if (!reviewerName || !rating || !comment) {
    res.status(400).json({ error: "Name, rating, and comment are required" });
    return;
  }
  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: "Rating must be between 1 and 5" });
    return;
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({ productId, reviewerName, reviewerEmail, rating, title, comment })
    .returning();

  // Update product rating
  const [stats] = await db
    .select({ avg: avg(reviewsTable.rating), count: count() })
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, productId));

  await db
    .update(productsTable)
    .set({
      ratingAverage: String(Number(stats.avg ?? 0).toFixed(2)),
      ratingCount: Number(stats.count ?? 0),
    })
    .where(eq(productsTable.id, productId));

  res.status(201).json({
    id: review.id,
    productId: review.productId,
    reviewerName: review.reviewerName,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    isVerifiedPurchase: review.isVerifiedPurchase,
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;
