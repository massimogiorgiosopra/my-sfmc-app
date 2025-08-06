const {
  MC_CLIENT_ID,
  MC_CLIENT_SECRET,
  MC_SUBDOMAIN,
  MC_DE_KEY,
  MC_ACCOUNT_ID
} = process.env;

const http = require('https');
const auth = {
  host: '{MC_SUBDOMAIN}.auth.marketingcloudapis.com',
  path: '/v2/token',
  method: 'POST',
  headers: {
    'content-type': 'application/json'
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

const req = http.request(auth, callback);
const body = `{
  "grant_type": "client_credentials",
  "client_id": MC_CLIENT_ID,
  "client_secret": MC_CLIENT_SECRET,
  "account_id": MC_ACCOUNT_ID
}`;
req.write(body);
req.end();

const run = {
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

const req = http.request(run, callback);
req.end();
