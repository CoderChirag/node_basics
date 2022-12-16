const path = require('path');
const PathIterator = require('./pathiterator');

function searchFile(fpath, filename, callback) {
	const pi = new PathIterator();
	pi.on('file', (file, stats) => {
		if (path.basename(file) == filename) callback(file, stats);
	});
	pi.iterate(fpath);
}

searchFile(path.join(__dirname, '..'), 'a.txt', (file, stats) => {
	console.log(file);
	console.log(stats);
});
