# firebase-function-face-crop
A Nodejs Firebase function script that listens on a bucket. When an image is uploaded to a bucket the function is triggered. 
The function:
(1) Makes a vision API call 
(2) Makes an API request to an external service 
(3) saves the face coordinates to the Realtime DB.

See android application to take a selfie.