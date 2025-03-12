import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import Stripe from "stripe"

export default async (req: MedusaRequest, res: MedusaResponse) => {
  const stripe = new Stripe(process.env.STRIPE_API_KEY, { apiVersion: "2023-10-16" })
  const sig = req.headers["stripe-signature"]
  
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    console.log("🔔 Stripe Webhook Event:", event.type)
    
    // Обрабатываем событие
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("✅ Payment Succeeded:", event.data.object)
        break
      case "payment_intent.payment_failed":
        console.log("❌ Payment Failed:", event.data.object)
        break
      default:
        console.log("⚠️ Unhandled Event:", event.type)
    }
    res.status(200).send({ received: true })
  } catch (err) {
    console.error("⚠️ Error processing Stripe webhook:", err)
    res.status(400).send({ error: "Webhook error" })
  }
}
