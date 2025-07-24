require('dotenv').config();
const axios = require('axios');

const {
  MC_CLIENT_ID,
  MC_CLIENT_SECRET,
  MC_ACCOUNT_ID,
  MC_SUBDOMAIN
} = process.env;

let accessToken = '';
let restUrl = '';

async function getAccessToken() {
  const url = `https://${MC_SUBDOMAIN}.auth.marketingcloudapis.com/v2/token`;
  console.log('🔷 Requesting Access Token...');

  const response = await axios.post(url, {
    grant_type: 'client_credentials',
    client_id: MC_CLIENT_ID,
    client_secret: MC_CLIENT_SECRET,
    account_id: MC_ACCOUNT_ID
  });

  accessToken = response.data.access_token;
  restUrl = response.data.rest_instance_url;
  console.log('✅ Got access token');
  console.log('ℹ️ REST URL:', restUrl);
}

async function listBusinessUnits() {
  console.log('🔷 Retrieving list of Business Units...');
  const url = `${restUrl}/platform/v1/bunit/`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const businessUnits = response.data.items || [];

  console.log(`✅ Found ${businessUnits.length} business units:\n`);

  businessUnits.forEach((bu, i) => {
    console.log(`🔹 [${i + 1}] Name: ${bu.name}`);
    console.log(`   MID (accountId): ${bu.accountId}`);
    console.log(`   Parent MID: ${bu.parentId}`);
    console.log(`   Email: ${bu.email}`);
    console.log(`   Type: ${bu.type}`);
    console.log(`   Created Date: ${bu.createdDate}`);
    console.log('----------------------------------------');
  });
}

async function main() {
  try {
    await getAccessToken();
    await listBusinessUnits();
    console.log('🎯 Done.');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error:', error.message);
    if (error.response) {
      console.error('🔥 Status:', error.response.status);
      console.error('🔥 Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
