const axios = require("axios");

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4003";

async function sendNotification(user_id, type, message) {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
      user_id,
      type,
      message,
    });
  } catch (err) {
    console.error("❌ Error enviando notificación:", err.message);
  }
}

module.exports = { sendNotification };