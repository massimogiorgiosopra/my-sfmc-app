require('dotenv').config();
const axios = require('axios');

const {
  MC_CLIENT_ID,
  MC_CLIENT_SECRET,
  MC_SUBDOMAIN,
  MC_DE_KEY
} = process.env;

let accessToken = '';
let restUrl = '';

async function getAccessToken() {
  const url = `https://mc8d6gk0bxk851g6-g02k91bwbwy.auth.marketingcloudapis.com/v2/token`;
  const resp = await axios.post(url, {
    grant_type: 'client_credentials',
    client_id: MC_CLIENT_ID,
    client_secret: MC_CLIENT_SECRET
  });
  accessToken = resp.data.access_token;
  restUrl = resp.data.rest_instance_url;
  console.log('✅ Got access token');
}

async function getDERows() {
  const url = `https://mc8d6gk0bxk851g6-g02k91bwbwy.rest.marketingcloudapis.com/data/v1/customobjectdata/key/${MC_DE_KEY}/rowset`;
  const resp = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  console.log(`📄 Retrieved ${resp.data.items.length} rows from DE`);
  return resp.data.items;
}

async function registerContact(row) {
  const contactKey = row.keys.ContactKey;
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

  const url = `https://mc8d6gk0bxk851g6-g02k91bwbwy.rest.marketingcloudapis.com/contacts/v1/contacts`;
  const resp = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const response = resp.data.responses[0];
  if (response.hasErrors) {
    console.log(`⚠️ Errors for ContactKey ${contactKey}:`);
    console.log(response.errors);
  } else {
    console.log(`✅ Registered Contact + MobilePush: ${contactKey}`);
  }
}

async function main() {
  try {
    await getAccessToken();

    const rows = await getDERows();

    for (const row of rows) {
      await registerContact(row);
    }

    console.log('🎉 Done!');
    process.exit(0);
  } catch (err) {
    console.error('🔥 Error:', err.message);
    process.exit(1);
  }
}

main();
