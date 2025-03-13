import express from "express";
import bodyParser from "body-parser";
import Stripe from "stripe";

const app = express();
const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: "2023-08-16",
});

app.post(
  "/hooks/payments/stripe",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"] as string;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
      // Обработка события:
      if (event.type === "payment_intent.succeeded") {
        console.log("Payment succeeded:", event.data.object.id);
      } else if (event.type === "payment_intent.payment_failed") {
        console.log("Payment failed:", event.data.object.id);
      }
      res.json({ received: true });
    } catch (err) {
      console.error("Error verifying webhook:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

app.listen(8080, () => console.log("Server running on port 8080"));
