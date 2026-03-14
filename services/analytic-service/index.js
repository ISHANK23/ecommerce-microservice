import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "analytic-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9094").split(","),
});

const consumer = kafka.consumer({ groupId: "analytic-service-group" });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({
      topic: "payment-successful",
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value.toString();
        const { userId, cart } = JSON.parse(value);
        console.log(`Received message from topic ${topic}:`, { userId, cart });
      },
    });
  } catch (err) {
    console.error("Error connecting to Kafka:", err);
  }
};

run();
