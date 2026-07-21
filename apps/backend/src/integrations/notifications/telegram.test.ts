import assert from "node:assert";
import test from "node:test";
import { TelegramBotProvider } from "./telegram.ts";

test("TelegramBotProvider sends message to Telegram API with chat_id", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      const strUrl = url.toString();
      assert.ok(strUrl.includes("/botbot_12345/sendMessage"));
      assert.strictEqual(init?.method, "POST");

      const body = JSON.parse(init?.body as string);
      assert.strictEqual(body.chat_id, 987654321);
      assert.strictEqual(body.text, "Your order #1001 is confirmed!");

      return new Response(
        JSON.stringify({
          ok: true,
          result: { message_id: 5555 },
        }),
        { status: 200 }
      );
    };

    const provider = new TelegramBotProvider("bot_12345");
    const result = await provider.sendTelegramMessage({
      chat_id: 987654321,
      text: "Your order #1001 is confirmed!",
    });

    assert.strictEqual(result.message_id, 5555);
    assert.strictEqual(result.chat_id, 987654321);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("TelegramBotProvider throws error if chat_id is missing", async () => {
  const provider = new TelegramBotProvider("bot_12345");
  await assert.rejects(
    async () =>
      provider.sendTelegramMessage({
        chat_id: "",
        text: "Test",
      }),
    /Telegram chat_id is strictly required/
  );
});
