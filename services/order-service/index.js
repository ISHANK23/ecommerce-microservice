import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "order-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9094").split(","),
});

const consumer = kafka.consumer({ groupId: "order-service-group" });
const producer = kafka.producer();

const run = async () => {
  try {
    // Connect consumer and producer
    await consumer.connect();
    await producer.connect();
    console.log("Order service connected to Kafka successfully");

    // Subscribe to payment-successful topic
    await consumer.subscribe({
      topic: "payment-successful",
      fromBeginning: true,
    });

    // Process messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value.toString();
        const { userId, cart } = JSON.parse(value);

        console.log(`\n📦 Processing order for user ${userId}`);
        console.log(
          `Cart items:`,
          cart.map((item) => `${item.name} - $${item.price}`).join(", "),
        );

        // Simulate order processing
        const orderId = `ORD-${Date.now()}`;
        const orderTotal = cart.reduce((acc, item) => acc + item.price, 0);

        console.log(`Order ID: ${orderId}`);
        console.log(`Order Total: $${orderTotal.toFixed(2)}`);
        console.log(`✅ Order created successfully`);

        // Publish order-successful event
        await producer.send({
          topic: "order-successful",
          messages: [
            {
              value: JSON.stringify({
                orderId,
                userId,
                cart,
                total: orderTotal,
                timestamp: new Date().toISOString(),
              }),
            },
          ],
        });

        console.log(`📨 Order confirmation sent to email service`);
      },
    });
  } catch (err) {
    console.error("Error in order service:", err);
  }
};

run();
