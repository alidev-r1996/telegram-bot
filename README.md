# Telegram Bot

This project is a Telegram bot built using **Node.js** and **Telegraf**. It provides features such as file upload and viewing prices for currencies, gold, and cryptocurrencies.

---

## 🚀 Setup Steps

### 1. Create a Bot in BotFather

1. Open Telegram and search for `@BotFather`.
2. Send the following command:

   ```
   /newbot
   ```
3. Choose a name for your bot (e.g., `My Test Bot`).
4. Pick a unique **username** ending with `bot` (e.g., `my_test_1996_bot`).
5. BotFather will provide an **API Token**. Save it, as you'll need it in the `.env` file.

---

### 2. Clone the Project

```bash
git clone https://github.com/alidev-r1996/telegram-bot.git
cd telegram-bot
```

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Create a `.env` File

Create a file named `.env` in the project root with the following content:

Get `API_KEY` for free from: <a href='https://BrsApi.ir'>BrsApi.ir</a>

```env
TELEGRAM_API_KEY=YOUR_BOTFATHER_TOKEN
API_KEY=YOUR_BRSAPI_KEY
PORT=3000
```

---

### 5. Run the Project Locally

```bash
node server.js
```

If everything is correct, you should see:

```
server is running on port 3000
```

---

### 6. Deploy to Render (or similar service)

#### Option 1: Web Service (Free)

* Connect your repository to Render.
* In Render settings:

  * Set **Environment** to Node.js.
  * Start Command:

    ```
    node server.js
    ```
  * Ensure the app reads the port from the `PORT` environment variable.
* Use **webhook** for the bot because free Render plans do not support persistent workers.

#### Option 2: Background Worker (Paid)

* If you want to use **long polling** (`bot.launch()`), create a Background Worker on Render or a similar service like **Koyeb Workers**.

---

## 📌 Features

* 📂 Upload files and get download links
* 💵 Get real-time currency prices (USD/EUR)
* 🥇 Get real-time gold prices
* ₿ Get cryptocurrency prices
* ⏱ Real-time updates from an external API

---

## 📚 Technologies

* [Node.js](https://nodejs.org/)
* [Telegraf](https://telegraf.js.org/)
* [Axios](https://axios-http.com/)

---

## ⚠️ Important Notes

* If deploying on a Web Service, you **must** use webhooks to avoid `409 conflict` errors.
* Never commit your `.env` file with sensitive API keys to GitHub.

---

## 🧑‍💻 Author

* [alidev-r1996](https://github.com/alidev-r1996)
