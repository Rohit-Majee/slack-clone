import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./config/inngest.js";
import chatRouter from "./routes/chat.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(clerkMiddleware());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRouter);

app.get("/", (req, res) => {
  res.send("server is live");
});

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== "production") {
      app.listen(PORT, () => {
        console.log(`Server is running on : http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.log("Error starting server", error);
    process.exit(1);
  }
};

startServer();

export default app;
