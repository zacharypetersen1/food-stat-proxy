var createError = require('http-errors');
var express = require('express');
var request = require("request");
var { CLIENT_ID, CLIENT_SECRET } = require("./clientCredentials");
var path = require('path');
var logger = require('morgan');

// Needs to be refreshed every 24 hours
var access_token = "";
function getToken() {
  var options = {
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

  request(options, function (error, response, body) {
    if (error) {
      // Try again in ten seconds
      setTimeout(getToken, 10000);
    }
    else{
      // Save token
      access_token = body.access_token;
      // Refresh token before it expires
      setTimeout(getToken, (body.expires_in-600) * 1000);
    }
  });
}

// Fetch token
getToken();

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.send(access_token);
});

module.exports = app;
