import express from "express";
import routes from "./routes"; // ✅ Этот импорт должен быть

const app = express();
app.use(express.json()); // ✅ Без этого Stripe Webhook НЕ БУДЕТ работать
app.use(routes);

export default app;
