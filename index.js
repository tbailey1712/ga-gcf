/**
 * Copyright 2018, McDuck Labs
 */

'use strict';

const Buffer = require('safe-buffer').Buffer;

function handleGET (req, res) {
  // Do something with the GET request
  var message = 'Hello McDuck! <br>'
  var project_id = process.env.project_id;

  message = message + 'URL: ' + req.baseUrl + '<br>';
  message = message + 'Project ID = ' + project_id + '<br>';

  var q = req.query.q;
  message = message + 'Query Type q=' + q;

  switch (q) {
    case 'GA':
      console.log("handleGET: Query is GA");
      getData();
      break;
    default:
      console.log("handleGET: No Query Specified");
      break;
  }

  //getData();

  res.status(200).send(message);
}

function handlePUT (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}
// [START functions_helloworld_http]
/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
// [START functions_tips_terminate]
exports.handleHttp = (req, res) => {

  switch (req.method) {
    case 'GET':
      console.log("helloMcDuck(): Incoming GET Request");
      handleGET(req, res);
      break;
    case 'PUT':
      console.log("helloMcDuck(): Incoming PUT Request");
      handlePUT(req, res);
      break;
    default:
      res.status(500).send({ error: 'Invalid Request' });
      break;
  }

};


function getData() {

  const { google } = require('googleapis');
  const scopes = 'https://www.googleapis.com/auth/analytics.readonly';

  console.log('getData(): email=' + process.env.client_email + ' private_key=' + process.env.private_key);

  const jwt = new google.auth.JWT(keys.client_email, null, keys.private_key, scopes);
  const view_id = '65651086';

  const response = jwt.authorize();
  const result = google.analytics('v3').data.ga.get({
    'auth': jwt,
    'ids': 'ga:' + view_id,
    'start-date': '30daysAgo',
    'end-date': 'today',
    'metrics': 'ga:pageviews'
  });

  console.log(JSON.stringify(response, null, 4));
}

