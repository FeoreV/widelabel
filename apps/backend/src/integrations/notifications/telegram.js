export class TelegramBotProvider {
    botToken;
    baseUrl;
    constructor(botToken = process.env.TELEGRAM_BOT_TOKEN || "test_bot_token", baseUrl = "https://api.telegram.org") {
        this.botToken = botToken;
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }
    async sendTelegramMessage(payload) {
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
