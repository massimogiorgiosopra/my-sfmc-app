const https = require('https');

// Read from env
const clientId = process.env.MC_CLIENT_ID;
const clientSecret = process.env.MC_CLIENT_SECRET;
const accountId = process.env.MC_ACCOUNT_ID;
const subdomain = process.env.MC_SUBDOMAIN;
const automationKey = process.env.MC_AUTOMATION_KEY;

// Validate env vars
if (!clientId || !clientSecret || !accountId || !subdomain || !automationKey) {
  console.error("❌ One or more environment variables are missing.");
  process.exit(1);
}

// Step 1: Get Access Token
const authOptions = {
  hostname: `${subdomain}.auth.marketingcloudapis.com`,
  path: '/v2/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const authPayload = JSON.stringify({
  grant_type: 'client_credentials',
  client_id: clientId,
  client_secret: clientSecret,
  account_id: accountId
});

const authRequest = https.request(authOptions, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (!data.access_token || !data.rest_instance_url) {
        console.error("❌ Invalid auth response:", data);
        return;
      }

      const accessToken = data.access_token;
      const instanceUrl = data.rest_instance_url;

      console.log("✅ Got access token");
      console.log("🔑 Token:", accessToken);
      console.log("🌍 REST URL:", instanceUrl);
      triggerAutomation(instanceUrl, accessToken);

    } catch (err) {
      console.error("❌ Failed to parse auth response:", err.message);
    }
  });
});

authRequest.on('error', err => {
  console.error("❌ Auth request failed:", err.message);
});

authRequest.write(authPayload);
authRequest.end();

// Function to trigger automation
function triggerAutomation(restUrl, token) {

  const options = {
    hostname: `${subdomain}.rest.marketingcloudapis.com`,
    path: `/automation/v1/automations/key:${automationKey}/actions/run`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = https.request(options, (res) => {
    let response = '';
    res.on('data', chunk => response += chunk);
    res.on('end', () => {
      console.log("🚀 Automation Trigger Response:");
      console.log(response);
    });
  });

  req.on('error', (err) => {
    console.error("❌ Automation trigger failed:", err.message);
  });

  req.end();
}
