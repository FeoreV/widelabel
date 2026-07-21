import assert from "node:assert";
import test from "node:test";
import {
  ConsoleEmailProvider,
  EmailNotificationService,
  ProductionSmtpEmailProvider,
  type IEmailProvider,
} from "./email.ts";

test("ConsoleEmailProvider sends email and logs payload", async () => {
  const provider = new ConsoleEmailProvider();
  const result = await provider.sendEmail({
    to: "customer@example.com",
    subject: "Order Confirmation #1001",
    html: "<p>Thank you for your order</p>",
  });

  assert.strictEqual(result.status, "sent");
  assert.ok(result.message_id.startsWith("console_msg_"));
});

test("EmailNotificationService sends email with retry and tracks delivery records", async () => {
  let callCount = 0;
  const mockFailingProvider: IEmailProvider = {
    async sendEmail() {
      callCount++;
      if (callCount < 2) {
        throw new Error("Temporary network glitch");
      }
      return {
        message_id: "mock_sent_999",
        status: "sent",
        timestamp: new Date(),
      };
    },
  };

  const service = new EmailNotificationService(mockFailingProvider);
  const record = await service.sendWithRetry({
    to: "test@domain.com",
    subject: "Retry Test",
    html: "<p>Test</p>",
  });

  assert.strictEqual(record.status, "sent");
  assert.strictEqual(record.attempts, 2);
  assert.strictEqual(callCount, 2);
});

test("ProductionSmtpEmailProvider creates smtp message id", async () => {
  const provider = new ProductionSmtpEmailProvider("smtp.wide-label.com", 587);
  const result = await provider.sendEmail({
    to: "user@domain.com",
    subject: "SMTP Test",
    html: "<p>SMTP</p>",
  });

  assert.strictEqual(result.status, "sent");
  assert.ok(result.message_id.startsWith("smtp_msg_"));
});
