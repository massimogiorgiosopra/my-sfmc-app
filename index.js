require('dotenv').config();
const axios = require('axios');

const {
  MC_CLIENT_ID,
  MC_CLIENT_SECRET,
  MC_SUBDOMAIN,
  MC_DE_KEY,
  CONTACT_KEY_TO_SEARCH
} = process.env;

let accessToken = "";
let restUrl = "";
let mid = "";

/**
 * Get Access Token & MID
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
    mid = resp.data.organization;
    console.log("✅ Got access token");
    console.log(`ℹ️ Access Token: ${accessToken}`);   
    console.log(`ℹ️ REST URL: ${restUrl}`);
    console.log(`ℹ️ Authenticated MID: ${mid}`);
  } catch (err) {
    console.error("🔥 Failed to get token:", err.response?.data || err.message);
    throw err;
  }
}
/*NEW CODE*/
async function getUnitInformation() {
    console.log("🔷 Get BU Information...");
  const url = `https://${MC_SUBDOMAIN}.auth.marketingcloudapis.com/platform/v1/tokenContext`;
  try {
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    BUID = resp.data.organization;
    console.log(`ℹ️ Authenticated MID: ${BUID}`);
}
  catch (err) {
    console.error("🔥 Failed to get token:", err.response?.data || err.message);
    throw err;
  }
}
/**
 * Read DE Rows
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
 * Search Contact by contactKey
 */
async function searchContactByKey(contactKey) {
  const url = `${restUrl}contacts/v1/contacts/search`;
  const payload = { contactKey };

  console.log(`🔷 Searching contact by contactKey: ${contactKey}`);
  console.log(`🔷 POST to: ${url}`);
  console.log(`🔷 Payload: ${JSON.stringify(payload, null, 2)}`);

  try {
    const resp = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Search by contactKey response:", JSON.stringify(resp.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error("🔥 Search by contactKey API Error:");
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("🔥 Search Request failed:", err.message);
    }
  }
}

/**
 * Search Contact by attributeSets
 */
async function searchContactByAttributes(contactKey) {
  const url = `${restUrl}contacts/v1/contacts/search`;
  const payload = {
    attributeSets: [
      {
        name: "Contact Demographics",
        attributes: [
          {
            name: "ContactKey",
            value: contactKey
          }
        ]
      }
    ]
  };

  console.log(`🔷 Searching contact using attributeSets for ContactKey: ${contactKey}`);
  console.log(`🔷 POST to: ${url}`);
  console.log(`🔷 Payload: ${JSON.stringify(payload, null, 2)}`);

  try {
    const resp = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Search by attributeSets response:", JSON.stringify(resp.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error("🔥 Search by attributeSets API Error:");
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
    await getUnitInformation();

    await getDERows();

    console.log(`🔷 Starting search tests for ContactKey: ${CONTACT_KEY_TO_SEARCH}`);

    await searchContactByKey(CONTACT_KEY_TO_SEARCH);
    await searchContactByAttributes(CONTACT_KEY_TO_SEARCH);

    console.log("🎯 Done!");
    process.exit(0);

  } catch (err) {
    console.error("💥 Fatal error:", err.message);
    process.exit(1);
  }
}

main();
