import { Router } from "express";
import stripeWebhookHandler from "./hooks/payments/stripe"; // ✅ Этот импорт должен быть

const router = Router();

router.use("/hooks/payments/stripe", stripeWebhookHandler); // ✅ Обязательно

export default router;
