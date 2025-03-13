import express from "express";
import routes from "./routes"; // ✅ Этот импорт должен быть

const app = express();
app.use(express.json()); // ✅ Убедись, что `express.json()` включён
app.use(routes); // ✅ Убедись, что маршруты подключены

export default app;
