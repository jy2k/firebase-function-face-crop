//Script to listen on a bucket. Once an image is uploaded we
//import dependencies
const functions = require('firebase-functions');
const vision = require('@google-cloud/vision');
const admin = require('firebase-admin');
const request = require('request');
//init
admin.initializeApp();
const bucketToListenOn = 'app-imm-bucket-in';

//define function name and bucket trigger
exports.callVisionPostGCS = functions.storage.bucket(bucketToListenOn).object().onFinalize(async (object) => {

	// Triggered image path
	const gcsURI = "gs://" + object.bucket + "/" + object.name; 
 	
	// Make vision API request
	const client = new vision.ImageAnnotatorClient();
	const results = await client.faceDetection(gcsURI);
	const face = results[0].faceAnnotations[0];	
	const detectionConfidence = face.detectionConfidence;
	const vertices = face.fdBoundingPoly.vertices;
 	
	// Extract face vertices
	const top =  vertices[1].y;
	const right = vertices[1].x;
	const left = vertices[3].x;
	const bottom = vertices[3].y;
	
	// Trigger external API via url and pass relevant paramש
	const urlValue = "https://firebasestorage.googleapis.com/v0/b/app-imm-bucket-in/o/"+object.name;
	const requestUrl = "https://cropper-rjxrs4o6dq-uc.a.run.app/?"+"url="+urlValue"?"+"top="+top+"&right="+right+"&left="+left+"&bottom="+bottom;
	request.get(requestUrl, function (error, response, body) {
	  console.log('error:', error); 
	  console.log('statusCode:', response && response.statusCode); 
	  console.log('body:', body); 
	});
	
	// Save face coordinates to realtime databse
	await admin.database().ref('/faces').push({face: vertices});
  
});
