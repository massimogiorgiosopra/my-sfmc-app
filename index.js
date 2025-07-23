const axios = require("axios");
require("dotenv").config();

const {
  MC_CLIENT_ID,
  MC_CLIENT_SECRET,
  MC_SUBDOMAIN,
  MC_DE_KEY
} = process.env;

let accessToken = "";
let restUrl = "";

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

async function registerContact(row) {
  const contactKey = "0030D00000nS6tWQAS";
  const values = row.values;

  const payload = {
    contacts: [
      {
        contactKey,
        attributeSets: [
          {
            name: "MobilePush Demographics",
            items: [
              {
                values: {
                  DeviceID: "06d51467-84b7-4835-982e-0570bbe71bbc",
                  DeviceToken: "12bkmVOlS7qEaHDCEbZlmM:APA91bHHkvpirhYr1oS1tXL5ZoVafy8EV3fmnQfHp3sbqNb_zyWhye57pBcO2RrbrkGAwu_a5MdXUUBs-GJpOIs8-SqQcABu1L6DWyK8EUGXiW2EBwG_xKU",
                  AppID: "d2bc490b-deeb-49df-b885-57c15c18f129",
                  Platform: "Android OS",
                  ContactKey: "0030D00000nS6tWQAS"
                },
              },
            ],
          },
        ],
      },
    ],
  };

  console.log("🔷 Preparing payload:");
  console.log(JSON.stringify(payload, null, 2));

  const url = `${restUrl}contacts/v1/contacts`;
  console.log(`🔷 POSTing to: ${url}`);

  try {
    const resp = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Response Status:", resp.status);
    console.log("✅ Response Data:", JSON.stringify(resp.data, null, 2));

    const response = resp.data.responses?.[0];
    if (response?.hasErrors) {
      console.error(`⚠️ API reported errors for ContactKey ${contactKey}:`);
      console.error(JSON.stringify(response.errors, null, 2));
    } else {
      console.log(`🎉 Successfully registered ContactKey ${contactKey}`);
    }

  } catch (err) {
    if (err.response) {
      console.error("🔥 API Error Response:");
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("🔥 Request failed:", err.message);
    }
    throw err;
  }
}

async function main() {
  try {
    await getAccessToken();

    const rows = await getDERows();

    for (const row of rows) {
      console.log("🔷 Processing row with ContactKey:", row.keys.ContactKey);
      await registerContact(row);
    }

    console.log("🎯 Done!");
    process.exit(0);
  } catch (err) {
    console.error("💥 Fatal error in process:", err.message);
    process.exit(1);
  }
}

main();
