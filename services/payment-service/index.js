import express from "express";
import cors from "cors";
import { Kafka } from "kafkajs";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json());

const kafka = new Kafka({
  clientId: "payment-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9094").split(","),
});

const producer = kafka.producer();

const connectToKafka = async () => {
  try {
    await producer.connect();
    console.log("Connected to Kafka successfully");
  } catch (err) {
    console.error("Error connecting to Kafka:", err);
  }
};

app.post("/payment-service", async (req, res) => {
  const { cart } = req.body;

  const userId = "123";

  await producer.send({
    topic: "payment-successful",
    messages: [
      {
        value: JSON.stringify({
          userId,
          cart,
        }),
      },
    ],
  });

  console.log("API endpoint hit");

  return res.status(200).send("Payment successful");
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err.message);
});

app.listen(8000, () => {
  connectToKafka();
  console.log("Payment service is running on port 8000");
});
