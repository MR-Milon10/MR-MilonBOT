const axios = require("axios");
const fs = require("fs");

module.exports = {
  name: "pp",
  execute: async ({ api, event }) => {
    try {
      const uid = Object.keys(event.mentions)[0] || event.senderID;
      const img = await axios.get(
        `https://graph.facebook.com/${uid}/picture?width=512&height=512`,
        { responseType: "arraybuffer" }
      );

      fs.writeFileSync("pp.jpg", img.data);

      api.sendMessage(
        {
          body: "🖼️ এই নাও প্রোফাইল ছবি",
          attachment: fs.createReadStream("pp.jpg")
        },
        event.threadID,
        () => fs.unlinkSync("pp.jpg")
      );
    } catch (e) {
      api.sendMessage("❌ pp আনতে পারলাম না!", event.threadID);
    }
  }
};
