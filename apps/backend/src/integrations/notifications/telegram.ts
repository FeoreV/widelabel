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
  sendTelegramMessage(
    payload: TelegramMessagePayload
  ): Promise<TelegramDeliveryResult>;
}

export class TelegramBotProvider implements ITelegramProvider {
  private botToken: string;
  private baseUrl: string;

  constructor(
    botToken: string = process.env.TELEGRAM_BOT_TOKEN || "test_bot_token",
    baseUrl: string = "https://api.telegram.org"
  ) {
    this.botToken = botToken;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  public async sendTelegramMessage(
    payload: TelegramMessagePayload
  ): Promise<TelegramDeliveryResult> {
    if (!payload.chat_id) {
      throw new Error("Telegram chat_id is strictly required");
    }

    const response = await fetch(`${this.baseUrl}/bot${this.botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: payload.chat_id,
        text: payload.text,
        parse_mode: payload.parse_mode || "HTML",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Telegram sendMessage failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
      message_id: data.result?.message_id || Date.now(),
      chat_id: payload.chat_id,
      sent_at: new Date(),
    };
  }
}
