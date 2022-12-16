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

## Files: reading and writing

Fully buffered reads and writes are fairly straightforward: call the function and pass in a String or a Buffer to write, and then check the return value.

### Reading a file (fully buffered)

```
fs.readFile('./index.html', 'utf8', function(err, data) {
    // the data is passed to the callback in the second argument
    console.log(data);
});
```

### Writing a file (fully buffered)

```
fs.writeFile('./results.txt', 'Hello World', function(err) {
    if(err) throw err;
    console.log('File write completed');
});
```

When we want to work with files in smaller parts, we need to `open()`, get a file descriptor and then work with that file descriptor.
`fs.open(path, flags[, mode[, callback]])` supports the following flags:

-   `'r'` - Open file for reading. An exception occurs if the file does not exist.
-   `'r+'` - Open file for reading and writing. An exception occurs if the file does not exist.
-   `'w'` - Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
-   `'w+'` - Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).
-   `'a'` - Open file for appending. The file is created if it does not exist.
-   `'a+'` - Open file for reading and appending. The file is created if it does not exist.

`mode` refers to the permissions to use in case a new file is created. The default is `0666`.

### Opening, writing to a file and closing it (in parts)

```
fs.open('./data/index.html', 'w', function(err, fd){
    if(err) throw err;
    var buf = new Buffer('bbbbbb\n');
    fs.write(fd, buf, 0, buf.length, null, function(err, written, buffer){
        if(err) throw err;
        console.log(err, written, buffer);
        fs.close(fd, function(){
            console.log('Done');
        });
    });
});
```

The `read()` and `write()` functions operate on Buffers, so in the example above we create a new `Buffer()` from a string.
Note that built-in readable streams (e.g. HTTP, Net) generally
return Buffers.

### Opening, seeking to a position, reading from a file and closing it (in parts)

```
fs.open('./data/index.html', 'r', function(err, fd){
    if(err) throw err;
    var buf = new Buffer(3);
    fs.read(fd, buf, 0, buf.length, null, function(err, bytesRead, buffer){
        if(err) throw err;
        console.log(err, bytesRead, buffer);
        fs.close(fd, function(){
            console.log('Done');
        });
    });
});
```

## Directories: read, create & delete

### Reading a directory

Reading a directory returns the names of the items (files, directories and others) in it.

```
var path = './data/';
fs.readdir(path, function(err, files){
    if(err) throw err;
    files.forEach(function(file){
        console.log(path+file);
        fs.stat(path+file, function(err, stats){
            console.log(stats);
        });
    });
});
```

`fs.stat()` gives us more information about each item. The object returned from `fs.stat` looks like this:

```
{
    dev: 2114,
    ino: 48064969,
    mode: 33188,
    nlink: 1,
    uid: 85,
    gid: 100,
    rdev: 0,
    size: 527,
    blksize: 4096,
    blocks: 8,
    atime: Mon, 10 Oct 2011 23:24:11 GMT,
    mtime: Mon, 10 Oct 2011 23:24:11 GMT,
    ctime: Mon, 10 Oct 2011 23:24:11 GMT
}
```

`atime`, `mtime` and `ctime` are Date instances.
The stat object also has the following functions:

-   `stats.isFile()`
-   `stats.isDirectory()`
-   `stats.isBlockDevice()`
-   `stats.isCharacterDevice()`
-   `stats.isSymbolicLink() (only valid with fs.lstat())`
-   `stats.isFIFO()`
-   `stats.isSocket()`

The Path module has a set of additional functions for working with paths, such as:
| | |
| -- | --
| `path.normalize(p)` | Normalize a string path, taking care of '..' and '.' parts.
| `path.join([path1[, path2[, ...]]])` | Join all arguments together and normalize the resulting path.
| `path.resolve([from...], to)` | Resolves to to an absolute path. If `to` isn't already absolute `from` arguments are prepended in right to left order, until an absolute path is found. If after using all `from` paths still no absolute path is found, the current working directory is used as well. The resulting path is normalized, and trailing slashes are removed unless the path gets resolved to the root directory.
| `fs.realpath(path[, callback])`<br>`fs.realpathSync(path)` | Resolves both absolute (`‘/path/file’`) and relative paths (`‘../../file’`) and returns the absolute path to the file.
| `path.dirname(p)` | Return the directory name of a path. Similar to the Unix `dirname` command.
| `path.basename(p[, ext])` | Return the last portion of a path. Similar to the Unix `basename` command.
| `path.extname(p)` | Return the extension of the path. Everything after the last `'.'` in the last portion of the path. If there is no `'.'` in the last portion of the path or the only `'.'` is the first character, then it returns an empty string.
| `path.exists(p[, callback])`<br>`path.existsSync(p)` | Test whether or not the given path exists. Then, call the callback argument with either true or false.

### Creating and deleting a directory

```
fs.mkdir('./newdir', 0666, function(err){
    if(err) thorw err;
    console.log('Created newdir');
    fs.rmdir('./newdir', function(err){
        if(err) throw err;
        console.log('Removed newdir');
    });
});
```
