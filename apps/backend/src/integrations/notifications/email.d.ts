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
export declare class ConsoleEmailProvider implements IEmailProvider {
    sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult>;
}
export declare class ProductionSmtpEmailProvider implements IEmailProvider {
    private smtpHost;
    private smtpPort;
    constructor(smtpHost?: string, smtpPort?: number);
    sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult>;
}
export interface DeliveryRecord {
    id: string;
    recipient: string;
    subject: string;
    status: "sent" | "failed";
    attempts: number;
    last_attempt_at: Date;
}
export declare class EmailNotificationService {
    private provider;
    private deliveryRecords;
    constructor(provider?: IEmailProvider);
    sendWithRetry(payload: EmailPayload, maxRetries?: number): Promise<DeliveryRecord>;
    getDeliveryRecord(id: string): DeliveryRecord | null;
}
