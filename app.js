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
      access_token = body.access_token;
      // Refresh token before it expires
      setTimeout(getToken, (body.expires_in-600) * 1000);
    }
  });
}

/*setTimeout(function(){
    // Save token
    var options2 = {
      method: 'POST',
      url: 'https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=toast&format=json',
      headers: { 'content-type': 'application/json', 'authorization': "Bearer " + access_token},
      json: true
    };
    request(options2, function(error, response, body2){
      console.log("hi");
      console.log(body2);
    });
  }, 6000);*/


// Fetch token
getToken();

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

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
