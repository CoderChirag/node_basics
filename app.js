const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const messages = [];
const clients = [];

const server = http.createServer((req, res) => {
	const url_parts = url.parse(req.url);
	if (url_parts.pathname === '/') {
		fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
			if (!err) {
				res.setHeader('Content-Type', 'text/html');
				res.end(data);
			} else {
				res.statusCode = 500;
				res.end('Server error');
			}
		});
	} else if (url_parts.pathname.substr(0, 5) === '/poll') {
		const count = url_parts.pathname.replace(/\D/g, ''); // \D ~ [^0-9]
		console.log(count);
		console.log(messages);
		if (messages.length > count) {
			res.end(
				JSON.stringify({
					count: messages.length,
					messages: messages.slice(count),
				})
			);
		} else {
			clients.push(res);
		}
	} else if (url_parts.pathname.substr(0, 5) === '/msg/') {
		const username = url_parts.pathname.split('/')[2];
		console.log(username);
		const msg = unescape(url_parts.pathname.split('/')[3]);
		const msgData = {
			date: new Date(),
			username: username,
			msg: msg,
		};
		messages.push(msgData);
		console.log(messages);
		clients.forEach(client => {
			client.end(
				JSON.stringify({
					count: messages.length,
					messages: [msgData],
				})
			);
		});
		clients.length = 0;
		res.end('Message received');
	}
});

server.listen(3000, 'localhost', () => {
	console.log('Server is listening on port 3000');
});
