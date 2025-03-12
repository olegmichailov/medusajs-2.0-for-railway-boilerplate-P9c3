import Stripe from "stripe";
import { MedusaContainer } from "@medusajs/medusa";
import { PaymentProviderService } from "@medusajs/medusa";

class StripeProviderService extends PaymentProviderService {
  static identifier = "stripe";

  protected stripe: Stripe;

  constructor(container: MedusaContainer, options) {
    super(container, options);
    this.stripe = new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: "2023-10-16",
    });
  }

  async createPayment(session) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: session.amount,
      currency: session.currency,
      payment_method_types: ["card"],
      metadata: { order_id: session.cart_id },
    });

    return { id: paymentIntent.id, status: paymentIntent.status };
  }

  async capturePayment(paymentData) {
    return this.stripe.paymentIntents.capture(paymentData.id);
  }

  async refundPayment(paymentData) {
    return this.stripe.refunds.create({ payment_intent: paymentData.id });
  }

  async webhookHandler(req) {
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Stripe webhook signature verification failed.", err);
      throw new Error("Webhook signature verification failed.");
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log(`Payment succeeded: ${paymentIntent.id}`);
    } else if (event.type === "payment_intent.payment_failed") {
      console.log("Payment failed: ", event.data.object);
    }

    return event;
  }
}

export default StripeProviderService;
