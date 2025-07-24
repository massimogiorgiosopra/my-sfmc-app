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
  console.log(`🔷 access token: ${accessToken}`);  
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
  // Log raw row for debugging
  console.log('🔍 Full DE row:', JSON.stringify(row, null, 2));

  // Safely extract ContactKey
  const contactKey = row?.keys?.ContactKey || row?.values?.contactkey || row?.ContactKey;
  
  if (!contactKey) {
    console.warn('⚠️ Skipping row: ContactKey missing or undefined.');
    return;
  }

  console.log(`🔷 Processing row with ContactKey: ${contactKey}`);

  const values = row.values || {};

const payload = {
  contacts: [
      {
      "contactKey": "acruz@example.com",
      "attributeSets": [{
          "name": "Email Addresses",
          "items": [{
              "values": [{
                  "name": "Email Address",
                  "value": "acruz@example.com"
              },
              {
                  "name": "HTML Enabled",
                  "value": true
              }]
          }]
      },
      {
          "name": "Email Demographics",
          "items": [{
              "values": [{
                  "name": "Last Name",
                  "value": "Cruz"
              },
              {
                  "name": "First Name",
                  "value": "Angela"
              },
              {
                  "name": "Text Profile Attribute",
                  "value": "value 1"
              },
              {
                  "name": "Number Profile Attribute",
                  "value": 12345
              }]
          }]
      },
      {
          "name": "MobileConnect Demographics",
          "items": [{
              "values": [{
                  "name": "Mobile Number",
                  "value": "317-531-5555"
              },
              {
                  "name": "Locale",
                  "value": "US"
              },
              {
                  "name": "Status",
                  "value": 1
              }]
          }]
      },
      {
          "name": "MobilePush Demographics",
          "items": [{
              "values": [{
                  "name": "Device ID",
                  "value": 958405948
              },
              {
                  "name": "Application",
                  "value": 958405948
              }]
          }]
      },
      {
          "name": "GroupConnect LINE Addresses",
          "items": [{
              "values": [{
                  "name": "Address ID",
                  "value": "addressId_from_api"
              }
             ]
          }]
      },
      {
  
          "name": "GroupConnect LINE Subscriptions",
          "items": [{
              "values": [{
                  "name": "Address ID",
                  "value": "addressId_from_api"
               },
               {
                  "name": "Channel ID",
                  "value": "1234567890"
              }]
          }]
      },
      {
          "name": "GroupConnect LINE Demographics",
          "items": [{
              "values": [{
                  "name": "Address ID",
                  "value": "addressId_from_api"
              },
              {
                  "name": "Display Name",
                  "value": "display_name"
              },
              {
                  "name": "Picture Url",
                  "value": "picture_url"
              },
              {
                  "name": "Status Message",
                  "value": "status_message"
              }]
          }]
      }
    ]
  }
  ]
};

  const url = `${restUrl}contacts/v1/contacts`;
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
