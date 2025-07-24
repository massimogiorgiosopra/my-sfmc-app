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


async function registerContact() {
  // Safely extract ContactKey
  const contactKey = "acruz@example.com";
  
  console.log(`🔷 Processing ContactKey: ${contactKey}`);

const payload = 
{
  "contacts": [
    {
      "contactKey": "test123@example.com",
      "attributeSets": [
        {
          "name": "Email Addresses",
          "items": [
            {
              "values": {
                "EmailAddress": "test123@example.com",
                "SubscriberKey": "test123@example.com",
                "Status": "Active"
              }
            }
          ]
        }
      ]
    }
  ]
}


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
    await registerContact();
    console.log('🎯 Done!');
    process.exit(0);
  } catch (err) {
    console.error('💥 Fatal error:', err.message);
    process.exit(1);
  }
}

main();
