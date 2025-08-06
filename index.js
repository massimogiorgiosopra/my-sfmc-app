const http = require('https');

const MC_CLIENT_ID = process.env.MC_CLIENT_ID;
const MC_CLIENT_SECRET = process.env.MC_CLIENT_SECRET;
const MC_ACCOUNT_ID = process.env.MC_ACCOUNT_ID;
const MC_SUBDOMAIN = process.env.MC_SUBDOMAIN;
  
const authcall = {
  host: `${MC_SUBDOMAIN}.auth.marketingcloudapis.com`,
  path: '/v2/token',
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  }
};
const authresp = function(response) {
  let authdata = Buffer.alloc(0);
  authResponse.on('data', function(chunk) {
    result = Buffer.concat([authdata, chunk]);
  });
  
  authResponse.on('end', function() {
  console.log(result.toString());
  });
};

const authrequest = http.request(authcall, authresp);
const authbody = JSON.stringify({
   grant_type: 'client_credentials',
   client_id: MC_CLIENT_ID,
   client_secret: MC_CLIENT_SECRET,
   account_id: MC_ACCOUNT_ID
});


authrequest.end();
