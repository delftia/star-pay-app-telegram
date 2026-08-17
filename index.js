import "dotenv/config";
import { Bot } from "grammy";

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", async (ctx) => {
  await ctx.api.sendInvoice(
    ctx.chat.id,
    "Оплатить",          // title
    "Заплати звездочку",  // description — ОБЯЗАТЕЛЬНО
    "star-test-1",           // payload
    "XTR",                   // валюта Stars
    [{ label: "1 Star", amount: 1 }]
  );
});

bot.on("pre_checkout_query", (ctx) => {
    ctx.answerPreCheckoutQuery(true);
  });
  
  // ЛОГ + ответ пользователю
  bot.on("message:successful_payment", async (ctx) => {
    const user = ctx.from;
    const payment = ctx.message.successful_payment;
  
    console.log("💰 STAR PAYMENT");
    console.log("User ID:", user.id);
    console.log("Username:", user.username || "—");
    console.log("First name:", user.first_name);
    console.log("Stars paid:", payment.total_amount);
    console.log("Payload:", payment.invoice_payload);
    console.log("Date:", new Date().toISOString());
    console.log("---------------------------");
  
    await ctx.reply("Звезда списана");
  });

bot.start();
