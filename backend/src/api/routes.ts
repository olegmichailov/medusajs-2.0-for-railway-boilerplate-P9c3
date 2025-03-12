import stripeWebhookHandler from "./hooks/payments/stripe";

export default async (router) => {
  router.post("/hooks/payments/stripe", stripeWebhookHandler);
};
