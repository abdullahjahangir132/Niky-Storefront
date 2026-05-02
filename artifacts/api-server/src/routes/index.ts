import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import authRouter from "./auth";
import customersRouter from "./customers";
import couponsRouter from "./coupons";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(customersRouter);
router.use(couponsRouter);
router.use(settingsRouter);

export default router;
