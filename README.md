# ga-gcf

Use Google Cloud Functions for querying Google Analytics

* GCF node-js v8 beta
* Google Cloud Platform APIs


## Installing and Running


1. Install dependencies:

        npm install

2. Run the tests:

        npm test

3. Deploy
		gcloud functions deploy handleHttp --runtime nodejs8 --trigger-http
		gcloud functions describe handleHttp

4. Configuration Variables (from the service key json)
		project_id
		client_email
		private_key