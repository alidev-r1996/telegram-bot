// server.js
// ✅ Refactored, stable, senior-level Telegram bot with Telegraf

const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");
const { createServer } = require("http");
require("dotenv").config();

const { PersianNumber, PersianCurrency } = require("./utils");

/* ------------------------
   Basic setup
------------------------- */
const bot = new Telegraf(process.env.TELEGRAM_API_KEY);
const API_URL = `https://BrsApi.ir/Api/Market/Gold_Currency.php?key=${process.env.API_KEY}`;

/* ------------------------
   Helpers (IMPORTANT)
------------------------- */

// Safe callback answer (prevents crashes)
const safeAnswer = async (ctx) => {
  try {
    await ctx.answerCbQuery();
  } catch (_) {}
};

// Always edit OR reply, never both
const showMainMenu = async (ctx, edit = false) => {
  const text = "خوش آمدید، لطفا یکی از گزینه‌ها را انتخاب کنید:";
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("📂 آپلود فایل و دریافت لینک", "upload")],
    [Markup.button.callback("💵 مشاهده قیمت‌ها", "prices")],
  ]);

  if (edit) {
    await ctx.editMessageText(text, keyboard);
  } else {
    await ctx.reply(text, keyboard);
  }
};

const backToMain = Markup.inlineKeyboard([[Markup.button.callback("⬅️ منوی اصلی", "start")]]);

/* ------------------------
   Start command
------------------------- */
bot.start(async (ctx) => {
  await showMainMenu(ctx);
});

bot.action("start", async (ctx) => {
  await safeAnswer(ctx);
  await showMainMenu(ctx, true);
});

/* ------------------------
   Upload flow
------------------------- */
bot.action("upload", async (ctx) => {
  await safeAnswer(ctx);

  await ctx.editMessageText(
    "📂 لطفاً فایل خود را ارسال کنید تا لینک دانلود ساخته شود",
    Markup.inlineKeyboard([[Markup.button.callback("⬅️ بازگشت", "start")]])
  );
});

bot.on("document", async (ctx) => {
  try {
    const fileId = ctx.message.document.file_id;
    const link = await ctx.telegram.getFileLink(fileId);

    await ctx.reply(`✅ فایل شما آپلود شد\n🔗 لینک دانلود:\n\n\`${link.href}\``, {
      parse_mode: "Markdown",
      reply_markup: backToMain.reply_markup,
    });
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ خطا در دریافت لینک فایل");
  }
});

/* ------------------------
   Prices menu
------------------------- */
bot.action("prices", async (ctx) => {
  await safeAnswer(ctx);

  await ctx.editMessageText(
    "لطفا نوع قیمت را انتخاب کنید:",
    Markup.inlineKeyboard([
      [Markup.button.callback("💵 دلار / یورو", "currency")],
      [Markup.button.callback("🥇 طلا", "gold")],
      [Markup.button.callback("₿ رمزارز", "crypto")],
      [Markup.button.callback("⬅️ بازگشت", "start")],
    ])
  );
});

/* ------------------------
   Currency
------------------------- */
bot.action("currency", async (ctx) => {
  await safeAnswer(ctx);

  try {
    await ctx.editMessageText("⏳ در حال دریافت قیمت ارز...");

    const { data } = await axios.get(`${API_URL}&section=currency`);

    const text = data.currency
      .map(
        (i) =>
          `*${i.name}*\nقیمت: ${PersianCurrency(i.price)}\nتغییر: ${PersianCurrency(i.change_value)} (${PersianNumber(
            i.change_percent
          )}%)`
      )
      .join("\n\n");

    await ctx.editMessageText(
      `*قیمت لحظه‌ای ارز*\n\n${text}\n\n🕒 ${PersianNumber(data.currency[0].time)} - ${PersianNumber(
        data.currency[0].date
      )}`,
      {
        parse_mode: "Markdown",
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback("⬅️ بازگشت", "prices")],
          [Markup.button.callback("🏠 منوی اصلی", "start")],
        ]).reply_markup,
      }
    );
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ خطا در دریافت قیمت ارز");
  }
});

/* ------------------------
   Gold
------------------------- */
bot.action("gold", async (ctx) => {
  await safeAnswer(ctx);

  try {
    await ctx.editMessageText("⏳ در حال دریافت قیمت طلا...");

    const { data } = await axios.get(API_URL);

    const text = data.gold
      .map(
        (i) =>
          `*${i.name}*\nقیمت: ${PersianCurrency(i.price)}\nتغییر: ${PersianCurrency(i.change_value)} (${PersianNumber(
            i.change_percent
          )}%)`
      )
      .join("\n\n");

    await ctx.editMessageText(`*قیمت لحظه‌ای طلا*\n\n${text}`, {
      parse_mode: "Markdown",
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ بازگشت", "prices")],
        [Markup.button.callback("🏠 منوی اصلی", "start")],
      ]).reply_markup,
    });
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ خطا در دریافت قیمت طلا");
  }
});

/* ------------------------
   Crypto
------------------------- */
bot.action("crypto", async (ctx) => {
  await safeAnswer(ctx);

  try {
    await ctx.editMessageText("⏳ در حال دریافت قیمت رمزارز...");

    const { data } = await axios.get(`${API_URL}&section=cryptocurrency`);

    const text = data.cryptocurrency
      .map(
        (i) =>
          `*${i.name}* (${i.symbol})\nقیمت: ${PersianCurrency(
            String(Number(i.price).toFixed()) + "000"
          )}\nتغییر: ${PersianNumber(i.change_percent)}%`
      )
      .join("\n\n");

    await ctx.editMessageText(`*₿ قیمت رمزارزها*\n\n${text}`, {
      parse_mode: "Markdown",
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ بازگشت", "prices")],
        [Markup.button.callback("🏠 منوی اصلی", "start")],
      ]).reply_markup,
    });
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ خطا در دریافت قیمت رمزارز");
  }
});

/* ------------------------
   Launch bot
------------------------- */
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

/* ------------------------
   Simple HTTP server (Liara / Render)
------------------------- */
const app = createServer((req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.end("<a href='https://t.me/alidev_r1996bot'>@alidev_r1996bot</a>");
});

app.listen(3000, () => {
  console.log("HTTP server running on port 3000");
});
