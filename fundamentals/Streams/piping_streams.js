const fs = require('fs');
const path = require('path');

process.stdin.pipe(fs.createWriteStream(path.join(__dirname, 'b.txt')));
process.stdin.resume(); // stdin is paused by default
