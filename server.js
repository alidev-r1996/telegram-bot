const { Telegraf } = require("telegraf");
const axios = require("axios");
const { PersianNumber, PersianCurrency } = require("./utils");
const {createServer} = require("http")
require("dotenv").config();

const bot = new Telegraf(process.env.TELEGRAM_API_KEY);
const API_URL = `https://BrsApi.ir/Api/Market/Gold_Currency.php?key=${process.env.API_KEY}`;

bot.start((ctx) => {
  ctx.reply(`خوش آمدید، لطفا یکی از گزینه‌ها را انتخاب کنید:`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📂 آپلود فایل و دریافت لینک", callback_data: "upload" }],
        [{ text: "💵 مشاهده قیمت‌ها", callback_data: "prices" }],
      ],
    },
  });
});

bot.action("start", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.deleteMessage();
  ctx.reply(`خوش آمدید، لطفا یکی از گزینه‌ها را انتخاب کنید:`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📂 آپلود فایل و دریافت لینک", callback_data: "upload" }],
        [{ text: "💵 مشاهده قیمت‌ها", callback_data: "prices" }],
      ],
    },
  });
});

bot.action("upload", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.deleteMessage();
  await ctx.reply("لطفاً فایل خود را ارسال کنید تا لینک دانلود برای شما ساخته شود.", {
    reply_markup: { inline_keyboard: [[{ text: "بازگشت", callback_data: "start" }]] },
  });
});

bot.on("document", async (ctx) => {
  try {
    const fileId = ctx.message.document.file_id;
    const link = await ctx.telegram.getFileLink(fileId);
    ctx.deleteMessage();
    await ctx.reply(`✅ فایل شما آپلود شد\n🔗 لینک دانلود:\n\`\`\`${link.href}\`\`\``, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: [[{ text: "منوی اصلی", callback_data: "start" }]] },
    });
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ خطا در دریافت لینک فایل");
  }
});

bot.action("prices", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.deleteMessage();
  ctx.reply("لطفا نوع قیمت را انتخاب کنید:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💵 قیمت دلار/یورو", callback_data: "currency" }],
        [{ text: "🥇 قیمت طلا", callback_data: "gold" }],
        [{ text: "₿ ارز دیجیتال", callback_data: "cryptocurrency" }],
        [{ text: "⬅️ بازگشت", callback_data: "start" }],
      ],
    },
  });
});

bot.action("currency", async (ctx) => {
  await ctx.answerCbQuery();
  try {
    const {
      data: { currency },
    } = await axios.get(`${API_URL}&section=currency`);

    const data = currency
      .map((i) => {
        return `*${i.name}*\nقیمت: ${PersianCurrency(i.price)}\nتغییر: ${PersianCurrency(
          i.change_value
        )} - (${PersianNumber(i.change_percent)}%)`;
      })
      .join("\n\n");

    await ctx.editMessageText(
      `*قیمت لحظه‌ای ارز*\n\n${data}\n\n*بروزرسانی:* ${PersianNumber(currency[0].time)} - ${PersianNumber(
        currency[0].date
      )}`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "بازگشت", callback_data: "start" }],
            [{ text: "منوی اصلی", callback_data: "prices" }],
          ],
        },
      }
    );
  } catch (err) {
    await ctx.reply("❌ خطا در دریافت قیمت ارز");
    console.error(err.response?.data || err.message);
  }
});

bot.action("gold", async (ctx) => {
  await ctx.answerCbQuery();
  try {
    const {
      data: { gold },
    } = await axios.get(`${API_URL}`);
    const data = gold
      .map((i) => {
        return `*${PersianNumber(i.name)}*\nقیمت: ${PersianCurrency(i.price)}\nتغییر: ${PersianCurrency(
          i.change_value
        )} - (${PersianNumber(i.change_percent)}%)`;
      })
      .join("\n\n");

    await ctx.editMessageText(
      `*قیمت لحظه‌ای طلا*\n\n${data}\n\n*بروزرسانی:* ${PersianNumber(gold[0].time)} - ${PersianNumber(gold[0].date)}  `,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "بازگشت", callback_data: "start" }],
            [{ text: "منوی اصلی", callback_data: "prices" }],
          ],
        },
      }
    );
  } catch (err) {
    await ctx.reply("❌ خطا در دریافت قیمت طلا");
    console.error(err);
  }
});

bot.action("cryptocurrency", async (ctx) => {
  await ctx.answerCbQuery();
  try {
    const {
      data: { cryptocurrency },
    } = await axios.get(`${API_URL}&section=cryptocurrency`);
    const data = cryptocurrency
      .map((i) => {
        return `*${i.name}*\nقیمت: ${PersianCurrency(String(Number(i.price).toFixed()) + "000")}\n نماد: ${
          i.symbol
        }\n تغییر: (${PersianNumber(i.change_percent)}%)`;
      })
      .join("\n\n");

    await ctx.editMessageText(
      `*₿ قیمت لحظه‌ای رمزارزها*\n(قیمت‌ها تقریبی است)\n\n${data}\n\n*بروزرسانی:* ${PersianNumber(
        cryptocurrency[0].time
      )} - ${PersianNumber(cryptocurrency[0].date)}`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "بازگشت", callback_data: "start" }],
            [{ text: "منوی اصلی", callback_data: "prices" }],
          ],
        },
      }
    );
  } catch (err) {
    await ctx.reply("❌ خطا در دریافت قیمت رمزارز");
    console.error(err.response?.data || err.message);
  }
});

bot.launch();


const app = createServer((req, res)=>{
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/html");
  if (req.url == "/"){
    res.end("<a href='https://t.me/alidev_r1996bot'>visit bot: @alidev_r1996bot</a>");
  }
})
app.listen(3000, () => {
  console.log("server is running on port 3000");
});

