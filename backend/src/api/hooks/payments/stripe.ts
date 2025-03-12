import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import Stripe from "stripe";

export default async (req: MedusaRequest, res: MedusaResponse) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const stripe = new Stripe(process.env.STRIPE_API_KEY, {
    apiVersion: "2023-08-16",
  });

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("✅ Webhook received:", event.type);

  res.status(200).json({ received: true });
};
