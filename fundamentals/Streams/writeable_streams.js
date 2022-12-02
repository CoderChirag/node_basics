const fs = require('fs');
const path = require('path');

const file = fs.createWriteStream(path.join(__dirname, 'a.txt'));

process.stdin.on('data', data => {
	file.write(data);
});

process.stdin.on('end', () => {
	file.end();
});

process.stdin.resume(); // stdin is paused by default
