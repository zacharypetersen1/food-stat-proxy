const express = require('express');
const request = require("request");
const { CLIENT_ID, CLIENT_SECRET } = require("./clientCredentials");

// Needs to be refreshed every 24 hours
let access_token = "";
function getToken() {
  const options = {
    method: 'POST',
    url: 'https://oauth.fatsecret.com/connect/token',
    method : 'POST',
    auth : {
      user : CLIENT_ID,
      password : CLIENT_SECRET
    },
    headers: { 'content-type': 'application/json'},
    form: {
      'grant_type': 'client_credentials',
      'scope' : 'basic'
    },
    json: true
  };

  request(options, (error, response, body) => {
    if (error) {
      // Try again in ten seconds
      setTimeout(getToken, 10000);
    }
    else{
      access_token = body.access_token;
      // Refresh token before it expires
      setTimeout(getToken, (body.expires_in-600) * 1000);
    }
  });
}

// Fetch token
getToken();

let app = express();

app.post("/fatsecret", (req, res) => {
  const params = req.url.split("?")[1];
  console.log(params);
  const options = {
    method: 'POST',
    url: 'https://platform.fatsecret.com/rest/server.api?' + params,
    headers: { 'content-type': 'application/json', 'authorization': "Bearer " + access_token},
    json: true
  };
  request(options, (error, response, body) => {
    res.send(body);
  });
});

module.exports = app;
