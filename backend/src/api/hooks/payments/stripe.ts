import { Router } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: "2023-08-16",
});

const router = Router();

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    console.log("✅ Stripe webhook received:", event);

    if (event.type === "payment_intent.succeeded") {
      console.log("💰 Payment succeeded:", event.data.object.id);
    } else if (event.type === "payment_intent.payment_failed") {
      console.log("❌ Payment failed:", event.data.object.id);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Error verifying Stripe webhook:", err);
    res.status(400).json({ error: "Webhook signature verification failed" });
  }
});

export default router;
