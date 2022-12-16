# File system

The file system functions consist of file I/O and directory I/O functions. All of the file system functions offer both synchronous (blocking) and asynchronous (non-blocking) versions. The difference between these two is that the synchronous functions (which have “Sync” in their name) return the value directly and prevent Node from executing any code while the I/O operation is being performed:

```
var fs = require('fs');
var data = fs.readFileSync('./index.html', 'utf8');
// wait for the result, then use it
console.log(data);
```

Asynchronous functions return the value as a parameter to a callback given to them:

```
var fs = require('fs');
fs.readFile('./index.html', 'utf8', function(err, data) {
// the data is passed to the callback in the second argument
console.log(data);
});
```

The table below lists all the asynchronous functions in the FS API. These functions have synchronous versions as well, but I left them out to make the listing more readable.
| | |
| --- | --- |
| **Read & write a file (fully buffered)** | `fs.readFile(filename[, encoding[, callback]])`<br>`fs.writeFile(fileName, data, encoding='utf8'[, callback])`
| **Read & write a file (in parts)** | `fs.open(path, flags[, mode[, callback]])`<br>`fs.read(fd, buffer, offset, length, position[, callback])`<br>`fs.write(fd, buffer, offset, length, position[, callback])`<br>`fs.fsync(fd, callback)`<br>`fs.truncate(fd, len[, callback])`<br>`fs.close(fd[, callback])`
| **Directories: read, create & delete** | `fs.readdir(path[, callback])`<br>`fs.mkdir(path, mode[, callback])`<br>`fs.rmdir(path[, callback])`
| **Files: info** | `fs.stat(path[, callback])`<br>`fs.lstat(path[, callback])`<br>`fs.fstat(fd[, callback])`<br>`fs.realpath(path[, callback])`
| **Readable streams** | `Class: fs.ReadStream: Events: 'close', 'open', 'ready'; Properties: readStream.bytesRead, readStream.path, readStream.pending`<br>`fs.createReadStream(path[, options])`
| **Writable streams** | `fs.WriteStream: Events: 'close', 'open', 'ready'; Properties: writeStream.bytesWritten`<br>`fs.createWriteStream(path[, options])`
| **Files: rename, watch changes & change timestamps** | `fs.rename(path1, path2[, callback])`<br>`fs.watchFile(filename[, options], listener)`<br>`fs.unwatchFile(filename)`<br>`fs.watch(filename[, options], listener)`<br>`fs.utimes(path, atime, mtime, callback)`<br>`fs.futimes(path, atime, mtime, callback)`
| **Files: Owner and permissions** | `fs.chown(path, uid, gid[, callback])`<br>`fs.fchown(path, uid, gid[, callback])`<br>`fs.lchown(path, uid, gid[, callback])`<br>`fs.chmod(path, mode[, callback])`<br>`fs.fchmod(fd, mode[, callback])`<br>`fs.lchmod(fd, mode[, callback])`
| **Files: symlinks** | `fs.link(srcpath, dstpath[, callback])`<br>`fs.symlink(linkdata, path[, callback])`<br>`fs.readlink(path[, callback])`<br>`fs.unlink(path[, callback])`

You should use the asynchronous version in most cases, but in rare cases (e.g. reading configuration files when starting a server) the synchronous version is more appropriate.
