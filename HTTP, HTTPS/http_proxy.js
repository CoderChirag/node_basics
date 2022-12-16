const http = require('http');
const url = require('url');

const server = http.createServer((sreq, sres) => {
	const url_parts = url.parse(sreq.url, true);
	console.log(sreq.url);
	console.log(url_parts);
	const opts = {
		host: 'www.google.com',
		port: 80,
		path: url_parts.path,
		method: sreq.method,
		headers: sreq.headers,
	};
	console.log(opts);
	opts.headers.host = 'www.google.com';
	const creq = http.request(opts, cres => {
		sres.writeHead(cres.statusCode, cres.headers);
		cres.pipe(sres); // pipe client response to server response
	});
	sreq.pipe(creq); // pipe server request to client request
});

server.listen(80, '0.0.0.0');
console.log('Server running.');
