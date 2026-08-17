import "dotenv/config";
import input from "input";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { Api } from "telegram";

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const botUsername = process.env.BOT_USERNAME;

if (!apiId || !apiHash || !botUsername) {
  console.error("❌ Заполни API_ID, API_HASH, BOT_USERNAME в .env");
  process.exit(1);
}

const session = new StringSession(process.env.SESSION || "");
const client = new TelegramClient(session, apiId, apiHash, {
  connectionRetries: 5,
});

async function main() {
  await client.start({
    phoneNumber: async () => await input.text("Phone (+7999...): "),
    phoneCode: async () => await input.text("Code (из Telegram): "),
    password: async () => await input.text("2FA password (если есть, иначе Enter): "),
    onError: (err) => console.log("Auth error:", err),
  });

  console.log("✅ Logged in");

  // Сохраним строковую сессию, чтобы потом не вводить код
  const newSession = client.session.save();
  console.log("\n🔐 SESSION (сохрани в .env как SESSION=...):\n", newSession, "\n");

  // Получаем peer бота (объект сущности)
  const peer = await client.getInputEntity(botUsername);

  // Запрашиваем баланс Stars
  const status = await client.invoke(
    new Api.payments.GetStarsStatus({
      peer,
    })
  );

  // В разных слоях/версиях поле может называться немного по-разному,
  // поэтому выводим всё + пробуем вытащить баланс.
  console.log("📦 Raw status:\n", status);

  // Попытка достать баланс
  const balance =
    status?.balance ??
    status?.stars?.balance ??
    status?.status?.balance;

  if (balance !== undefined) {
    console.log("\n⭐ Stars balance:", balance);
  } else {
    console.log("\n⚠️ Не смог автоматически достать balance — смотри Raw status выше.");
  }

  await client.disconnect();
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
