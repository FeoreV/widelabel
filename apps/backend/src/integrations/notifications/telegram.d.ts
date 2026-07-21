export interface TelegramMessagePayload {
    chat_id: string | number;
    text: string;
    parse_mode?: "MarkdownV2" | "HTML";
}
export interface TelegramDeliveryResult {
    message_id: number;
    chat_id: string | number;
    sent_at: Date;
}
export interface ITelegramProvider {
    sendTelegramMessage(payload: TelegramMessagePayload): Promise<TelegramDeliveryResult>;
}
export declare class TelegramBotProvider implements ITelegramProvider {
    private botToken;
    private baseUrl;
    constructor(botToken?: string, baseUrl?: string);
    sendTelegramMessage(payload: TelegramMessagePayload): Promise<TelegramDeliveryResult>;
}
