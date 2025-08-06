const http = require('https');
const init = {
  host: '{subdomain}.auth.marketingcloudapis.com',
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

const req = http.request(init, callback);
const body = `{
  "grant_type": "client_credentials",
  "client_id": "u62kv6duobqgod3t5example",
  "client_secret": "POiA9FJ6eWW2BuedVexample",
  "account_id": "99999"
}`;
req.write(body);
req.end();
