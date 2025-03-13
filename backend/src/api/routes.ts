import { Router } from "express";
import stripeWebhookHandler from "./hooks/payments/stripe";

const router = Router();

// Stripe Webhook
router.use("/hooks/payments/stripe", stripeWebhookHandler);

export default router;
