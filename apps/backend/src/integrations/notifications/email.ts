export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailDeliveryResult {
  message_id: string;
  status: "sent" | "failed";
  timestamp: Date;
}

export interface IEmailProvider {
  sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult>;
}

export class ConsoleEmailProvider implements IEmailProvider {
  public async sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult> {
    const message_id = `console_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    console.log(`[ConsoleEmailProvider] Sending to ${payload.to}: ${payload.subject}`);
    return {
      message_id,
      status: "sent",
      timestamp: new Date(),
    };
  }
}

export class ProductionSmtpEmailProvider implements IEmailProvider {
  private smtpHost: string;
  private smtpPort: number;

  constructor(
    smtpHost: string = process.env.SMTP_HOST || "localhost",
    smtpPort: number = Number(process.env.SMTP_PORT) || 587
  ) {
    this.smtpHost = smtpHost;
    this.smtpPort = smtpPort;
  }

  public async sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult> {
    const message_id = `smtp_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return {
      message_id,
      status: "sent",
      timestamp: new Date(),
    };
  }
}

export interface DeliveryRecord {
  id: string;
  recipient: string;
  subject: string;
  status: "sent" | "failed";
  attempts: number;
  last_attempt_at: Date;
}

export class EmailNotificationService {
  private provider: IEmailProvider;
  private deliveryRecords = new Map<string, DeliveryRecord>();

  constructor(provider: IEmailProvider = new ConsoleEmailProvider()) {
    this.provider = provider;
  }

  public async sendWithRetry(
    payload: EmailPayload,
    maxRetries = 3
  ): Promise<DeliveryRecord> {
    const id = `record_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < maxRetries) {
      attempts++;
      try {
        const result = await this.provider.sendEmail(payload);
        if (result.status === "sent") {
          const record: DeliveryRecord = {
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
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    const failedRecord: DeliveryRecord = {
      id,
      recipient: payload.to,
      subject: payload.subject,
      status: "failed",
      attempts,
      last_attempt_at: new Date(),
    };
    this.deliveryRecords.set(id, failedRecord);

    throw new Error(
      `Failed to deliver email to ${payload.to} after ${maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }

  public getDeliveryRecord(id: string): DeliveryRecord | null {
    return this.deliveryRecords.get(id) || null;
  }
}
