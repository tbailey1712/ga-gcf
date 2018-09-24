/**
 * Copyright 2018, McDuck Labs
 *
 * Deploy with:
 * gcloud functions deploy handleHttp --runtime nodejs8 --trigger-http
 *
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
  message = message + 'Query Type q=' + q + '<br>';

  switch (q) {
    case 'GA':
      console.log("handleGET: Query is GA");
      var resp = getData4(); 
      message = message + 'GA query returned: ' + resp + '<br>';
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
      console.log("handleHttp(): Incoming GET Request");
      handleGET(req, res);
      break;
    case 'PUT':
      console.log("handleHttp(): Incoming PUT Request");
      handlePUT(req, res);
      break;
    default:
      res.status(500).send({ error: 'Invalid Request' });
      break;
  }

};


async function getData4()
{
  var {google} = require('googleapis');
  var scopes = 'https://www.googleapis.com/auth/analytics.readonly';
  var viewID = process.env.view_id;
  var analytics = google.analyticsreporting('v4');

  const service_account = require('./npm-service-key.json'); 
  //var key = "-----BEGIN PRIVATE KEY-----n+ZG7UI/HR+spW\n-----END PRIVATE KEY-----\n"; 
  //var jwtClient = new google.auth.JWT(process.env.client_email, null, key, scopes, null);
  var jwtClient = new google.auth.JWT(service_account.client_email, null, service_account.private_key, scopes, null);
  jwtClient.authorize();
 
  
  var req = {
    reportRequests: [{
      viewId: viewID,
      dateRanges: { startDate: 'yesterday', endDate: 'yesterday', },
      metrics: { expression: 'ga:pageviews' }
    }],
  };
  
  
  var pv = -1;
  
  console.log("getData4(): Sending GA Request");

  analytics.reports.batchGet({
      auth: jwtClient,
      resource: req
    },
    function (err, response) {
      if (err) {
        console.log('Failed to get Report');
        console.log(err);
        return;
      } 

      console.log('Query Success');
      var data = response.data.reports[0].data;
      /*  For showing all the props
      for(var property in data) {
        console.log(property + "=" + data[property]);
      } */
      console.log("Data=" + JSON.stringify(data, null, 4) );
      pv = data.totals[0]["values"];
      console.log("Pageviews=" + pv); 
      storeValue("Yesterday", "Pageviews", pv.toString() );
    }
  );
  
  storeValue("Yesterday2", "col1", "TestValet");
  storeValue("Yesterday2", "col1", "TestValet2");
  storeValue("Yesterday2", "col2", "TestValet");

  console.log("Value Returning: " + pv );
 
  console.log("Stored value is: " + getValue("Yesterday") );

  return pv;  
}

function storeValue(row, key, value)
{
  // KIND, KEY, VALUE

  console.log("storeValue row=" + row + " key=" + key + " value=" + value);

  const Datastore = require('@google-cloud/datastore');
  const projectId = process.env.project_id;

  const datastore = Datastore({ projectId: projectId });

  const kind = 'GA';
  const gcskey = datastore.key([kind, row]);

  const entry = {
    key: gcskey,
    data: {
      key : value
    }
  };

  datastore.save(entry)
    .then(() => console.log("storeValue Success.") )
    .catch((err) => {
      console.error(err);
    });  

}

function getValue(row)
{
  console.log("getValue row=" + row);

  const Datastore = require('@google-cloud/datastore');
  const projectId = process.env.project_id;

  const datastore = Datastore({ projectId: projectId });

  const kind = 'GA';
  const gcskey = datastore.key([kind, row]);

  return datastore.get(gcskey)
    .then(([entity]) => {
      // The get operation will not fail for a non-existent entity, it just
      // returns an empty dictionary.
      if (!entity) {
        throw new Error(`No entity found for key ${key.path.join('/')}.`);
      }
    })
    .catch((err) => {
      console.error(err);
      return Promise.reject(err);
    });  
}

