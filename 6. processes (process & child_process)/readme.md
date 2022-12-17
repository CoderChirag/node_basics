# Process

## Contents

- [Process](#process)
  - [Contents](#contents)
  - [Process Events](#process-events)
    - [Event `'exit'`](#event-exit)
    - [Event `'uncaughtException'`](#event-uncaughtexception)
  - [Process Streams](#process-streams)
  - [Process Properties](#process-properties)
  - [Process Methods](#process-methods)
- [Child Process](#child-process)
  - [`child_process` Methods](#child_process-methods)

The global `process` object provides information about, and control over, the current Node.js process.

```
const process = require('node:process');
```

Each Node.js process has a set of built-in functionality, accessible through the global `process` module. The `process` module doesn't need to be required - it is somewhat literally a wrapper around the currently executing process, and many of the methods it exposes are actually wrappers around calls into core C libraries.
<br>

The `process` object is an instance of `EventEmitter`.

## Process Events

There are several events emitted by `process`

-   `'beforeExit'`
-   `'disconnect'`
-   `'exit'`
-   `'message'`
-   `'rejectionHandled'`
-   `'uncaughtException'`
-   `'uncaughtExceptionMonitor'`
-   `'unhandledRejection'`
-   `'warning'`
-   `'worker'`

### Event `'exit'`

Fires whenever the process is about to exit as a result of either :

-   The `process.exit()` method being called explicitly
-   The Node.js event loop no longer having any additional work to perform.

```
process.on('exit', (code) => {
    fs.writeFileSync('/tmp/myfile', 'This MUST ne saved on exit.');
});
```

### Event `'uncaughtException'`

Fires whenever an exception has occurred that hasn't been caught or dealt with somewhere else in your program.
It's not the ideal way to handle errors, but it can be very useful as a last line of defense if a program needs to stay running indefinitely.

```
process.on('uncaughtException', (err) => {
    console.error('An uncaught error occurred!');
    console.error(err.stack);
});
```

The default behavior on `uncaughtException` is to print a stack trace and exit - using the above, your program will display the message provided and the stack trace, but will **not** exit.

## Process Streams

The process object also provides wrappings for the three `STDIO` streams, `stdin`, `stdout`, and `stderr`. Put briefly, `stdin` is a readable stream (where one would read input from the user), `stdout` is a non-blocking writeable stream (writes to stdout are asynchronous, in other words), and `stderr` is a blocking (synchronous) writeable stream.
<br>

The simplest one to describe is `process.stdout`. Technically, most output in Node.js is accomplished by using `process.stdout.write()` - though most people would never know it. The following is from `console.js` in Node.js core:

```
exports.log = function(){
    process.stdout.write(format.apply(this, arguments) + '\n');
};
```

The streams are covered in detailed in [Streams](<../1.%20fundamentals%20(Timers%2C%20Streams%2C%20Buffers%20%26%20Event%20Emitters)/1.3%20streams/readme.md>)

## Process Properties

The `process` object additionally contains a variety of properties that allow you to access information about the running process. Let's run through a few quick examples with the help of the REPL:

```
> process.pid
3290
> process.version
'v0.4.9'
> process.platform
'win32'
> process.title
'node'
```

The `pid` is the OS Process ID, `platform` is something general like `'linux'` or `'darwin'`, and `version` refers to your Node.js version. `process.title` is a little bit different - while set to node by default, it can be set to anything you want, and will be what gets displayed in lists of running processes.
<br>

The `process` module also exposes `process.argv`, an array containing the command-line arguments to the current process, and `process.argc`, an integer representing the number of arguments passed in.
<br>

`process.execPath` will return the absolute path of the executable that started this process.
<br>

`process.env` contains your environment variables.

## Process Methods

There are also a variety of methods attached to the `process` object, many of which deal with quite advanced aspects of a program. We'll take a look at a few of the more commonly useful ones.
<br>

`process.exit([code])` exits the process. If you call an asynchronous function and then call `process.exit()` immediately afterwards, you will be in a race condition - the asynchronous call may or may not complete before the process is exited. `process.exit()` accepts one optional argument - an integer exit code. `0`, by convention, is an exit with no errors.
<br>

`process.cwd()` returns the 'current working directory' of the process - this is often the directory from which the command to start the process was issued.
<br>

`process.chdir()` is used to change the current working directory. For example:

```
> process.cwd()
'C:\\Program Files\\nodejs'
> process.chdir('D:\\abc')
> process.cwd()
'D:\\abc'
```

Finally, on a more advanced note, we have `process.nextTick(callback)`. This method accepts one argument - a callback - and places it at the top of the next iteration of the event loop. Some people do something like this:

```
setTimeout(() => {// code here}, 0);
```

This, however, is not ideal. In Node.js, this should be used instead:

```
process.nextTick(() => {
 // code here
});
```

It is much more efficient, and much more accurate.
<br>

`process.nextTick()` is covered in detailed manner in [Timers](<../1.%20fundamentals%20(Timers,%20Streams,%20Buffers%20&%20Event%20Emitters)/1.1%20timers/readme.md>)

# Child Process

The `node:child_process` module provides the ability to spawn subprocesses in a manner that is similar, but not identical, to `popen(3)` in linux.
<br>

The `popen()` function in linux opens a process by creating a pipe, forking, and invoking the shell.
<br>

This capability is primarily provided by the `child_process.spawn()` function:

```
const fs = require('fs');
const spawn = require('child_process').spawn;
const filename = process.argv[2];

if(!filename){
    throw Error('A file to watch must be specified!');
}

fs.watch(filename, () => {
    const ls = spawn('ls', ['-l', '-h', filename]);
    ls.stdout.pipe(process.stdout);
});
console.log(`Now watching ${filename} for changes...`);
```

Save the file as `watcher-spawn.js` and run it with node:

```
$ node watcher-spawn.js target.txt
Now watching target.txt for changes...
```

If you go to a different console and touch the target file, your Node js program will produce something like this:

```
-rw-rw-r-- 1 jimbo jimbo 6 Dec 8 05:19 target.txt
```

The first parameter to `spawn()` is the name of the program we wish to execute; in our case it’s `ls`. The second parameter is an array of command-line arguments. It contains the flags and the target filename.
<br>

The object returned by `spawn()` is a ChildProcess. Its `stdin`, `stdout`, and `stderr` properties are Streams that can be used to read or write data. We want to send the standard output from the child process directly to our own standard output stream. This is what the `pipe()` method does.

A modified version of this program is given in [watcher-spawn.js](./watcher-spawn.js).

## `child_process` Methods

For convenience, the `node:child_process` module provides a handful of synchronous and asynchronous alternatives to `child_process.spawn()` and `child_process.spawnSync()`. Each of these alternatives are implemented on top of `child_process.spawn()` or `child_process.spawnSync()`:

-   `child_process.exec()`: spawns a shell and runs a command within that shell, passing the `stdout` and `stderr` to a callback function when complete.
-   `child_process.execFile()`: similar to `child_process.exec()` except that it spawns the command directly without first spawning a shell by default.
-   `child_process.fork()`: spawns a new Node.js process and invokes a specified module with an IPC communication channel established that allows sending messages between parent and child.
-   `child_process.execSync()`: a synchronous version of `child_process.exec()` that will block the Node.js event loop.
-   `child_process.execFileSync()`: a synchronous version of `child_process.execFile()` that will block the Node.js event loop.
