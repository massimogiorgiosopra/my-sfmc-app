require('dotenv').config();
const axios = require('axios');

const {
  MC_CLIENT_ID,
  MC_CLIENT_SECRET,
  MC_SUBDOMAIN,
  MC_DE_KEY
} = process.env;

let accessToken = "";
let restUrl = "";

/**
 * Get Access Token
 */
async function getAccessToken() {
  console.log("🔷 Requesting Access Token...");
  const url = `https://${MC_SUBDOMAIN}.auth.marketingcloudapis.com/v2/token`;
  try {
    const resp = await axios.post(url, {
      grant_type: "client_credentials",
      client_id: MC_CLIENT_ID,
      client_secret: MC_CLIENT_SECRET,
    });
    accessToken = resp.data.access_token;
    restUrl = resp.data.rest_instance_url;
    console.log("✅ Got access token");
    console.log(`ℹ️ REST URL: ${restUrl}`);
  } catch (err) {
    console.error("🔥 Failed to get token:", err.response?.data || err.message);
    throw err;
  }
}

/**
 * Read DE Rows (optional, just to prove token works)
 */
async function getDERows() {
  console.log("🔷 Fetching DE Rows...");
  const url = `${restUrl}data/v1/customobjectdata/key/${MC_DE_KEY}/rowset`;
  try {
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(`✅ Retrieved ${resp.data.items.length} rows from DE`);
    return resp.data.items;
  } catch (err) {
    console.error("🔥 Failed to fetch DE rows:", err.response?.data || err.message);
    throw err;
  }
}

/**
 * Search Contact
 */
async function searchContact(contactKey) {
  const url = `${restUrl}contacts/v1/contacts/search`;
  const payload = { contactKey };

  console.log("🔷 Searching contact via /contacts/v1/contacts/search");
  console.log(`🔷 POST to: ${url}`);
  console.log(`🔷 Payload: ${JSON.stringify(payload, null, 2)}`);

  try {
    const resp = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Search response:", JSON.stringify(resp.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error("🔥 Search API Error Response:");
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("🔥 Search Request failed:", err.message);
    }
  }
}

/**
 * Main flow
 */
async function main() {
  try {
    await getAccessToken();

    const rows = await getDERows();

    const contactKey = "0030D00000m52U1QAI";

    console.log("🔷 Starting search test with ContactKey:", contactKey);

    await searchContact(contactKey);

    console.log("🎯 Done!");
    process.exit(0);

  } catch (err) {
    console.error("💥 Fatal error in process:", err.message);
    process.exit(1);
  }
}

main();
