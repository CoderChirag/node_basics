const fs = require('fs');
const EventEmitter = require('events').EventEmitter;

class PathIterator extends EventEmitter {
	iterate(path) {
		this.statDirectory(path, (fpath, stats) => {
			if (stats.isFile()) this.emit('file', fpath, stats);
			else if (stats.isDirectory()) {
				this.emit('directory', fpath, stats);
				this.iterate(fpath);
			}
		});
	}

	statDirectory(path, callback) {
		fs.readdir(path, (err, files) => {
			if (err) this.emit('error', err);
			files.forEach(file => {
				const fpath = `${path}/${file}`;
				fs.stat(fpath, (err, stats) => {
					if (err) this.emit('error', err);
					callback(fpath, stats);
				});
			});
		});
	}
}

module.exports = PathIterator;
