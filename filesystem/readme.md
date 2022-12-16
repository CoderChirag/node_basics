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

## Using Readable and Writable streams

Already covered in [streams](<../fundamentals%20(Timers%2C%20Streams%2C%20Buffers%20%26%20Event%20Emitters)/streams/readme.md>)

## Practical Example

Since Node makes it very easy to launch multiple asynchronous file accesses, you have to be careful when performing large amounts of I/O operations: you might exhaust the available number of file handles (a limited operating system resource used to access files). Furthermore, since the results are returned in an asynchronous manner which does
not guarantee completion order, you will most likely want to coordinate the order of execution using the [control flow patterns](../control%20flow%20patterns/readme.md) discussed in previous section. Let’s look at
an example.

### Example: searching for a file in a directory, traversing recursively

In this example, we will search for a file recursively starting from a given path.
The function takes 3 arguments:

-   a path to search,
-   the name of the file we are looking for,
-   and a callback which is called when the file is found.

#### Naive Recursive Version

Here is the naive version: a bunch of nested callbacks, no thought needed:

```
var fs = require('fs');
function findFile(path, searchFile, callback){
    fs.readdir(path, function(err, files){
        files.forEach(function(file){
            fs.stat(path+'/'+file, function(){
                if(err) return callback(err);
                if(stats.isFile() && file == searchFile){
                    callback(undefined, path+'/'+file);
                }else if(stats.isDirectory()){
                    findFile(path+'/'+file, searchFile, callback);
                }
            });
        });
    });
}

findFile('./test', 'needle.txt', function(err, path){
    if(err) throw err;
    console.log('Found file at: ' + path);
});
```

#### Splitted Recursive version

Splitting the function into smaller functions makes it somewhat easier to understand:

```
var fs = require('fs');

function findFile(path, searchFile, callback){
    // check for a match, given a stat
    function isMatch(err, stats){
        if(err) return callback(err);
        if(stats.isFile() && file == searchFile){
            callback(undefined, path+'/'+file);
        }else if(stats.isDirectory()){
            statDirectory(path+'/'+file, isMatch);
        }
    }
    // launch the search
    statDirectory(path, isMatch);
}

// Read and stat a directory
function statDirectory(path, callback){
    fs.readdir(path, function(err, callback){
        if(err) throw err;
        files.forEach(function(file){
            fs.stat(path+'/'+file, callback);
        });
    });
}

findFile('./test', 'needle.text', function(err, path){
    if(err) throw err;
    console.log('Found file at: ' + path);
});
```

The function is split into smaller parts:

-   `findFile`: This code starts the whole process, taking the main input arguments as well as the callback to call with the results.
-   `isMatch`: This hidden helper function takes the results from `stat()` and applies the "is a match" logic necessary to implement `findFile()`.
-   `statDirectory`: This function simply reads a path, and calls the callback for each file.

#### PathIterator: Improving reuse by using an EventEmitter

We can accomplish the same goal in a more reusable manner by creating our own module (`pathiterator.js`), which treats directory traversal as a stream of events by using `EventEmitter`:

```
var fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    util = require('util');

var PathIterator = function(){};

// argument with EventEmitter
util.inherits(PathIterator, EventEmitter);

// Iterate a path, emitting 'file' and 'directory' events.
PathIterator.prototype.iterate = function(path){
    var self = this;
    this.statDirectory(path, function(fpath, stats){
        if(stats.isFile()){
            self.emit('file', fpath, stats);
        }else if(stats.isDirectory()){
            self.emit('directory', fpath, stats);
            self.iterate(path+'/'+file);
        }
    });
};

// Read and stat a directory
PathIterator.prototype.statDirectory = function(path, callback){
    fs.readdir(path, function(err, files){
        if(err) self.emit('error', err);
        files.forEach(function(file){
            var fpath = path+'/'+file;
            fs.stat(fpath, function(err, stats){
                if(err) self.emit('error', err);
                callback(fpath, stats);
            });
        });
    });
}

module.exports = PathIterator;
```

We can then use this utility class to implement the same directory traversal:

```
var PathIterator = require('./pathiterator.js');
function findFile(path, searchFile, callback) {
    var pi = new PathIterator();
    pi.on('file', function(file, stats) {
        if(file == searchFile) {
            callback(undefined, file);
        }
    });
    pi.on('error', callback);
    pi.iterate(path);
}
```

While this approach takes a few lines more than the pure-callback approach, the result is a somewhat nicer and extensible (for example - you could look for multiple files in the “file” callback easily).
<br>

If you end up writing a lot of code that iterates paths, having a PathIterator EventEmitter will simplify your code. The callbacks are still there - after all, this is non-blocking I/O via the event loop - but the interface becomes a lot easier to understand. You are probably running `findFile()` as part of some larger process - and instead of having all that file travelsal logic in the same module, you have a fixed interface which you can write your path traversing operations against.
