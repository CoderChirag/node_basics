const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const messages = [];
const clients = [];

const server = http.createServer((req, res) => {
	res.end('Response from server');
});

server.listen(3000, 'localhost', () => {
	console.log('Server is listening on port 3000');
});
