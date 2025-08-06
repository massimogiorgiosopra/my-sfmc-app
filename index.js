const https = require('https');

// Load variables from environment (Heroku)
const clientId = process.env.MC_CLIENT_ID;
const clientSecret = process.env.MC_CLIENT_SECRET;
const accountId = process.env.MC_ACCOUNT_ID;
const subdomain = process.env.MC_SUBDOMAIN;
const automationKey = process.env.MC_AUTOMATION_KEY;

// Step 1: Request Access Token
const authOptions = {
  host: `${subdomain}.auth.marketingcloudapis.com`,
  path: '/v2/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const authBody = JSON.stringify({
  grant_type: 'client_credentials',
  client_id: clientId,
  client_secret: clientSecret,
  account_id: accountId
});

const authRequest = https.request(authOptions, (authResponse) => {
  let authData = Buffer.alloc(0);

  authResponse.on('data', (chunk) => {
    authData = Buffer.concat([authData, chunk]);
  });

  authResponse.on('end', () => {
    const result = JSON.parse(authData.toString());
    const accessToken = result.access_token;
    const instanceUrl = result.rest_instance_url;

    if (!accessToken || !instanceUrl) {
      console.error('❌ Failed to retrieve access token or instance URL');
      return;
    }

    console.log('✅ Access token received');
    console.log('🔑 Token:', accessToken);
    console.log('🌍 Instance URL:', instanceUrl);

    // Step 2: Trigger the Automation
    const automationPath = ;
    const automationOptions = {
      host: `${subdomain}.rest.marketingcloudapis.com`,
      path: `/automation/v1/automations/key:${automationKey}/actions/run`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const automationRequest = https.request(automationOptions, (automationResponse) => {
      let result = Buffer.alloc(0);

      automationResponse.on('data', (chunk) => {
        result = Buffer.concat([result, chunk]);
      });

      automationResponse.on('end', () => {
        console.log('🚀 Automation Trigger Response:');
        console.log(result.toString());
      });
    });

    automationRequest.on('error', (e) => {
      console.error('🔥 Automation request error:', e.message);
    });

    automationRequest.end();
  });
});

authRequest.on('error', (e) => {
  console.error('🔥 Auth request error:', e.message);
});

authRequest.write(authBody);
authRequest.end();
