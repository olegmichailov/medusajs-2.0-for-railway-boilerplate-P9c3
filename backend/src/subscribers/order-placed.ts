import { Modules } from "@medusajs/framework/utils"
import { INotificationModuleService, IOrderModuleService } from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { EmailTemplates } from "../modules/email-notifications/templates"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  
  const order = await orderModuleService.retrieveOrder(data.id, {
    relations: ["items", "summary", "shipping_address"]
  })

  const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(order.shipping_address.id)

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",  // ✅ Исправлено: "email" вместо "resend"
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: "weara@gmorkl.de",  // ✅ Указан твой email
          subject: "Your order has been placed",
        },
        order,
        shippingAddress,
        preview: "Thank you for your order!",
      },
    })
  } catch (error) {
    console.error("❌ Ошибка отправки email:", error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed"
}
