import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "email-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9094").split(","),
});

const consumer = kafka.consumer({ groupId: "email-service-group" });

const sendEmail = (to, subject, body) => {
  // Simulate email sending
  console.log("\n" + "=".repeat(60));
  console.log("📧 SENDING EMAIL");
  console.log("=".repeat(60));
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`\n${body}`);
  console.log("=".repeat(60));
  console.log("✅ Email sent successfully\n");
};

const run = async () => {
  try {
    await consumer.connect();
    console.log("Email service connected to Kafka successfully");

    // Subscribe to order-successful topic
    await consumer.subscribe({
      topic: "order-successful",
      fromBeginning: true,
    });

    // Process messages and send emails
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value.toString();
        const { orderId, userId, cart, total, timestamp } = JSON.parse(value);

        // Prepare email content
        const userEmail = `user${userId}@example.com`;
        const subject = `Order Confirmation - ${orderId}`;

        const itemsList = cart
          .map(
            (item, idx) =>
              `${idx + 1}. ${item.name} - $${item.price.toFixed(2)}`,
          )
          .join("\n");

        const emailBody = `
Dear Customer,

Thank you for your order! Your order has been confirmed and is being processed.

Order Details:
--------------
Order ID: ${orderId}
Order Date: ${new Date(timestamp).toLocaleString()}

Items:
${itemsList}

Total Amount: $${total.toFixed(2)}

We'll send you another email once your order has been shipped.

Thank you for shopping with us!

Best regards,
E-Commerce Team
        `;

        // Send confirmation email
        sendEmail(userEmail, subject, emailBody);
      },
    });
  } catch (err) {
    console.error("Error in email service:", err);
  }
};

run();
