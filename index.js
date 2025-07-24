require('dotenv').config();
const axios = require('axios');

const {
  MC_CLIENT_ID,
  MC_CLIENT_SECRET,
  MC_SUBDOMAIN,
  MC_DE_KEY,
  MC_ACCOUNT_ID
} = process.env;

let accessToken = '';
let restUrl = '';

async function getAccessToken() {
  const url = `https://${MC_SUBDOMAIN}.auth.marketingcloudapis.com/v2/token`;
  console.log('🔷 Requesting Access Token...');
  const resp = await axios.post(url, {
    grant_type: 'client_credentials',
    client_id: MC_CLIENT_ID,
    client_secret: MC_CLIENT_SECRET,
    account_id: MC_ACCOUNT_ID
  });
  accessToken = resp.data.access_token;
  restUrl = resp.data.rest_instance_url;
  console.log('✅ Got access token');
  console.log('ℹ️ REST URL:', restUrl);
}

async function getDERows() {
  console.log('🔷 Fetching DE Rows...');
  const url = `${restUrl}/data/v1/customobjectdata/key/${MC_DE_KEY}/rowset`;
  try {
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!resp.data || !resp.data.items) {
      console.error('❌ No items found in DE response:');
      console.error(JSON.stringify(resp.data, null, 2));
      return [];
    }

    console.log(`✅ Retrieved ${resp.data.items.length} rows from DE`);
    return resp.data.items;

  } catch (err) {
    console.error('🔥 Error fetching DE rows:');
    console.error('Status:', err.response?.status);
    console.error('Data:', JSON.stringify(err.response?.data, null, 2));
    throw new Error('💥 Fatal error in getDERows: ' + err.message);
  }
}


async function registerContact(row) {
  const contactKey = row.keys?.ContactKey || row.values?.ContactKey;
  console.log(`🔷 Processing row with ContactKey: ${contactKey}`);
  const values = row.values;

  const payload = {
    contacts: [
      {
        contactKey,
        attributeSets: [
          {
            name: 'MobilePush Demographics',
            items: [
              {
                values: {
                  DeviceID: values.DeviceID,
                  DeviceToken: values.DeviceToken,
                  AppID: values.AppID,
                  Platform: values.Platform,
                  ContactKey: contactKey
                }
              }
            ]
          }
        ]
      }
    ]
  };

  const url = `${restUrl}/contacts/v1/contacts`;
  console.log('🔷 Preparing payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log(`🔷 POSTing to: ${url}`);

  try {
    const resp = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const response = resp.data.responses?.[0];
    if (response?.hasErrors) {
      console.log(`⚠️ Errors for ContactKey ${contactKey}:`);
      console.log(response.errors);
    } else {
      console.log(`✅ Registered Contact + MobilePush: ${contactKey}`);
    }
  } catch (error) {
    console.error('🔥 API Error Response:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    throw new Error('💥 Fatal error in process: ' + error.message);
  }
}

async function main() {
  try {
    await getAccessToken();
    const rows = await getDERows();
    for (const row of rows) {
      await registerContact(row);
    }
    console.log('🎯 Done!');
    process.exit(0);
  } catch (err) {
    console.error('💥 Fatal error:', err.message);
    process.exit(1);
  }
}

main();
