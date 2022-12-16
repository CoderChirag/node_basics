# Process

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

### Process Properties

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
