import { Modules } from '@medusajs/framework/utils'
import { IPaymentModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'

export default async function stripeWebhookHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const paymentModuleService: IPaymentModuleService = container.resolve(Modules.PAYMENT)

  try {
    await paymentModuleService.handleWebhook("stripe", data)
    console.log("✅ Stripe webhook processed successfully")
  } catch (error) {
    console.error("❌ Error processing Stripe webhook:", error)
  }
}

export const config: SubscriberConfig = {
  event: 'payment.stripe'
}
