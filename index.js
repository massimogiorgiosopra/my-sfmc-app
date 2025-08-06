const http = require('https');

const MC_CLIENT_ID = process.env.MC_CLIENT_ID;
const MC_CLIENT_SECRET = process.env.MC_CLIENT_SECRET;
const MC_ACCOUNT_ID = process.env.MC_ACCOUNT_ID;
const MC_SUBDOMAIN = process.env.MC_SUBDOMAIN;
  
const auth = {
  host: `${MC_SUBDOMAIN}.auth.marketingcloudapis.com`,
  path: '/v2/token',
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  }
};
const authresponse = function(response) {
  let authresult = Buffer.alloc(0);
  response.on('data', function(chunk) {
    authresult = Buffer.concat([authresult, chunk]);
  });
  
  response.on('end', function() {
  console.log(authresult.toString());
  });
};

const req = http.request(auth, authresponse);
const body = JSON.stringify({
   grant_type: 'client_credentials',
   client_id: MC_CLIENT_ID,
   client_secret: MC_CLIENT_SECRET,
   account_id: MC_ACCOUNT_ID
});

const req = http.request(auth, authresponse);


const automation = {
  host: `${MC_SUBDOMAIN}.rest.marketingcloudapis.com`,
  path: '/automation/v1/automations/key:{key}/actions/runallonce',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
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
const req = http.request(automation, callback);

req.write(body);
req.end();
