import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { ORDER_PLACED } from '../modules/email-notifications/templates/order-placed'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

  const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
  const shippingAddress = order.shipping_address

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'resend', // или 'email', если используешь SendGrid
      template: ORDER_PLACED, // Используемый шаблон
      data: {
        order,
        shippingAddress,
        subject: 'Your order has been placed'
      }
    })
    console.log('✅ Order confirmation notification sent successfully.')
  } catch (error) {
    console.error('❌ Error sending order confirmation notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
