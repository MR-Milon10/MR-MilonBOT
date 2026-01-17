const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "emoji_voice",
    version: "2.0.3",
    author: "Milon",
    shortDescription: "Sends a cute girl's voice for emoji 😍",
    category: "system"
  },

  onChat: async function({ event, message }) {
    const { body } = event;
    if (!body || body.length > 2) return;

    // --- Emoji audio mapping ---
    const emojiAudioMap = {
      "😍": ["https://files.catbox.moe/qjfk1b.mp3"],
      "😂": ["https://files.catbox.moe/2sweut.mp3","https://files.catbox.moe/jl3pzb.mp3"],
      "🥺": ["https://files.catbox.moe/wc17iq.mp3","https://files.catbox.moe/dv9why.mp3"],
      "😢": ["https://files.catbox.moe/shxwj1.mp3"],
      "😘": ["https://files.catbox.moe/sbws0w.mp3","https://files.catbox.moe/37dqpx.mp3"],
      "😁": ["https://files.catbox.moe/60cwcg.mp3"],
      "😌": ["https://files.catbox.moe/epqwbx.mp3"],
      "😎": ["https://files.catbox.moe/l90704.mp3"]
      // চাইলে আরও emoji add করতে পারো
    };

    const emoji = body.trim();
    const audioList = emojiAudioMap[emoji];
    if (!audioList) return;

    // --- Random audio select ---
    const audioUrl = audioList[Math.floor(Math.random() * audioList.length)];

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const filePath = path.join(
      cacheDir,
      `${encodeURIComponent(emoji)}_${Date.now()}_${Math.floor(Math.random() * 1000)}.mp3`
    );

    try {
      const response = await axios.get(audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(response.data));

      // reply with mp3
      await message.reply({ attachment: fs.createReadStream(filePath) });

      // delete file after sending
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete cache file:", err);
      });
    } catch (err) {
      console.error(err);
      message.reply("ইমোজি দিয়ে ভয়েস পাঠাতে পারলাম না 😢");
    }
  }
};
