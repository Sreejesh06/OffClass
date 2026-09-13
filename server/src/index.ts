import express from "express";
import { UserSchema } from "shared";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  const result = UserSchema.safeParse({
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Sreejesh",
    email: "test@example.com",
    house: "RED",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.json({
    status: "ok",
    schemaWorks: result.success
  });
});

app.listen(3000);