require('dotenv').config();
const axios = require('axios');

const {
  MC_CLIENT_ID,
  MC_CLIENT_SECRET,
  MC_SUBDOMAIN,
  MC_DE_KEY,
  ID,
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

const http = require('https');
const init = {
  host: `https://${MC_SUBDOMAIN}.rest.marketingcloudapis.com`,
  path: '/automation/v1/automations/{id}/actions/runallonce',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
};
const callback = function(response) {
  let result = Buffer.alloc(0);
  response.on('data', function(chunk) {
    result = Buffer.concat([result, chunk]);
  });
  
  response.on('end', function() {
    // result has response body buffer
    console.log(result.toString());
  });
};

const req = http.request(init, callback);
req.end();
