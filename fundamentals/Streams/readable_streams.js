const fs = require('fs');
const path = require('path');

const file = fs.createReadStream(path.join(__dirname, 'readme.md'));

file.on('error', err => {
	console.log('Error' + err);
	throw err;
});

file.on('data', data => {
	console.log('Data' + data);
});

file.on('end', () => {
	console.log('Finished reading all of the data');
});
