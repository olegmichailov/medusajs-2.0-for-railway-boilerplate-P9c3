import { Router } from "express"
import stripeWebhookHandler from "../webhooks/stripe"

const router = Router()

router.post("/hooks/payments/stripe", stripeWebhookHandler)

export default router
