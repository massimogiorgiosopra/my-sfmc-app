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
    // result has response body buffer
    console.log(result.toString());
  });
};

const req = http.request(init, callback);
const body = `{
  "grant_type": "client_credentials",
  "client_id": "mjo118smj8gpxby9r43i46vw",
  "client_secret": "PKHj46KTMh9sKxJN4iGyDdoC",
  "account_id": "100006681"
}`;
req.write(body);
req.end();
