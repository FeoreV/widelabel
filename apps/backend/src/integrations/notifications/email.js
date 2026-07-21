export class ConsoleEmailProvider {
    async sendEmail(payload) {
        const message_id = `console_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        console.log(`[ConsoleEmailProvider] Sending to ${payload.to}: ${payload.subject}`);
        return {
            message_id,
            status: "sent",
            timestamp: new Date(),
        };
    }
}
export class ProductionSmtpEmailProvider {
    smtpHost;
    smtpPort;
    constructor(smtpHost = process.env.SMTP_HOST || "localhost", smtpPort = Number(process.env.SMTP_PORT) || 587) {
        this.smtpHost = smtpHost;
        this.smtpPort = smtpPort;
    }
    async sendEmail(payload) {
        const message_id = `smtp_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        return {
            message_id,
            status: "sent",
            timestamp: new Date(),
        };
    }
}
export class EmailNotificationService {
    provider;
    deliveryRecords = new Map();
    constructor(provider = new ConsoleEmailProvider()) {
        this.provider = provider;
    }
    async sendWithRetry(payload, maxRetries = 3) {
        const id = `record_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        let attempts = 0;
        let lastError = null;
        while (attempts < maxRetries) {
            attempts++;
            try {
                const result = await this.provider.sendEmail(payload);
                if (result.status === "sent") {
                    const record = {
                        id,
                        recipient: payload.to,
                        subject: payload.subject,
                        status: "sent",
                        attempts,
                        last_attempt_at: new Date(),
                    };
                    this.deliveryRecords.set(id, record);
                    return record;
                }
            }
            catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
            }
        }
        const failedRecord = {
            id,
            recipient: payload.to,
            subject: payload.subject,
            status: "failed",
            attempts,
            last_attempt_at: new Date(),
        };
        this.deliveryRecords.set(id, failedRecord);
        throw new Error(`Failed to deliver email to ${payload.to} after ${maxRetries} attempts. Last error: ${lastError?.message}`);
    }
    getDeliveryRecord(id) {
        return this.deliveryRecords.get(id) || null;
    }
}
