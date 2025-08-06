const {
  MC_CLIENT_ID,
  MC_CLIENT_SECRET,
  MC_SUBDOMAIN,
  MC_DE_KEY,
  MC_ACCOUNT_ID
}

const http = require('https');
const init = {
  host: 'mc8d6gk0bxk851g6-g02k91bwbwy.auth.marketingcloudapis.com',
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
  console.log(result.toString());
  });
};

const req = http.request(init, callback);
const body = `{
   grant_type: 'client_credentials',
   client_id: MC_CLIENT_ID,
   client_secret: MC_CLIENT_SECRET,
   account_id: MC_ACCOUNT_ID
}`;
req.write(body);
req.end();
