import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/database";
import transcriptionRoutes from "./routes/transcriptionRoutes";
import cors from "cors";
dotenv.config();

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.use("/transcriptions", transcriptionRoutes);

connectDB()
  .then(() => {
    console.log("Database connection established...");

    app.listen(PORT, () => {
      console.log(`Server is successfully listening on port ${PORT}...`);
    });
  })
  .catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Database cannot be connected!!", msg);
  });

export default app;
