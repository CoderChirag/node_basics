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
