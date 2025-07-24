const https = require('https');
const querystring = require('querystring');

// 🔧 Configuration
const clientId = 'mjo118smj8gpxby9r43i46vw';
const clientSecret = 'PKHj46KTMh9sKxJN4iGyDdoC';
const accountId = '100010244';
const subdomain = 'mc8d6gk0bxk851g6-g02k91bwbwy'; 

// 🔹 Contact info
const contactKey = 'acruz@example.com';
const email = 'acruz@example.com';

// 🔹 Step 1: Get Access Token
function getAccessToken(callback) {
  const postData = JSON.stringify({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    account_id: accountId
  });

  const options = {
    hostname: `${subdomain}.auth.marketingcloudapis.com`,
    path: '/v2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      const parsed = JSON.parse(data);
      if (parsed.access_token && parsed.rest_instance_url) {
        callback(null, parsed.access_token, parsed.rest_instance_url);
      } else {
        console.error('❌ Failed to get token');
        console.error(parsed);
      }
    });
  });

  req.on('error', e => console.error(`Request error: ${e.message}`));
  req.write(postData);
  req.end();
}

// 🔹 Step 2: Register Contact
function registerContact(token, restUrl) {
  const payload = JSON.stringify({
    contacts: [
      {
        contactKey: contactKey,
        attributeSets: [
          {
            name: 'Email Addresses',
            items: [
              {
                values: {
                  EmailAddress: email,
                  SubscriberKey: contactKey,
                  Status: 'Active'
                }
              }
            ]
          }
        ]
      }
    ]
  });

  const url = new URL(`${restUrl}contacts/v1/contacts`);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log('✅ Response:');
      console.log(data);
    });
  });

  req.on('error', e => {
    console.error(`❌ Error sending contact: ${e.message}`);
  });

  req.write(payload);
  req.end();
}

// 🔹 Start Process
getAccessToken((err, token, restUrl) => {
  if (err) {
    console.error('❌ Token error:', err);
  } else {
    console.log('✅ Access Token received');
    console.log('🔹 REST URL:', restUrl);
    registerContact(token, restUrl);
  }
});
