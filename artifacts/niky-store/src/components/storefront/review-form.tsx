import { useState } from "react";
import { useCreateReview } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ReviewFormProps {
  productId: number;
  onSuccess: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const mutation = useCreateReview({
    mutation: {
      onSuccess: () => {
        setRating(0); setReviewerName(""); setTitle(""); setComment("");
        onSuccess();
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !reviewerName) return;
    mutation.mutate({
      id: productId,
      data: { reviewerName, rating, title: title || "", comment: comment || "" },
    });
  };

  return (
    <div className="bg-secondary/20 rounded-2xl border border-border p-6">
      <h3 className="font-display font-bold text-xl uppercase tracking-tight mb-6">Write a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)} className="p-0.5">
                <Star className={`w-7 h-7 transition-colors ${s <= (hoverRating || rating) ? "fill-accent text-accent" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Your Name</Label>
            <Input value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Enter your name" required />
          </div>
          <div>
            <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Review Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your experience" />
          </div>
        </div>
        <div>
          <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Review</Label>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts about the product..." rows={4} />
        </div>
        <Button type="submit" disabled={mutation.isPending || !rating || !reviewerName} className="font-display uppercase tracking-wider">
          {mutation.isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  );
}
