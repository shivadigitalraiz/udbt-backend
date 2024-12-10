const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");
const path = require("path");
//const lead = require("./fcmApikey.json");

// Your Firebase project ID
const projectId = "udbt-f4db9";

// Scopes required for FCM
const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

// Function to get access token
exports.getAccessToken = async () => {
  try {
    const auth = new GoogleAuth({
      keyFile: path.join(__dirname, "../fcmApikey.json"),
      scopes: SCOPES,
    });
    const client = await auth.getClient();
    ``;
    const accessToken = await client.getAccessToken();
    return accessToken.token;
  } catch (error) {
    throw new Error(`Failed to get access token: ${error.message}`);
  }
};

// Function to send the message
exports.sendMessage = async (accessToken, message, callback) => {
  try {
    //const accessToken = await getAccessToken();
    const FCM_URL = `https://fcm.googleapis.com/v1/projects/udbt-f4db9/messages:send`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.post(FCM_URL, message, { headers });
    callback(null, response.data);
    // console.log('Message sent successfully:', response.data);
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response ? error.response.data : error.message
    );
    callback(error, null);
  }
};
