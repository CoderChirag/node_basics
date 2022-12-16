// Firstly generate your own certificate and key
//  > openssl genrsa -out privatekey.pem 1024
//  > openssl req -new -key privatekey.pem -out certrequest.csr
//  > openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem

// HTTPS
const https = require('https');
const fs = require('fs');

// read in the private key and certificate
const pk = fs.readFileSync('./privatekey.pem');
const pc = fs.readFileSync('./certificate.pem');
const opts = { key: pk, cert: pc };

// create the secure server
const serv = https.createServer(opts, (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({ message: 'Hello World' }));
});
// listen on port 443
serv.listen(443, '0.0.0.0');
console.log('Server Running');
