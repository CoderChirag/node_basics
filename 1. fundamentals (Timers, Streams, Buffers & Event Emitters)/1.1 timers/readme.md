# Timers

The timers library consists of mainly 6 global functions :

-   `setTimeout(callback[,delay[, ...args]])` - Returns `<Timeout>` for use with `clearTimeout`.
-   `setInterval(callback[,delay[, ...args]])` - Returns `<Timeout>` for use with `clearInterval`.
-   `setImmediate(callback[, ...args])` - Returns `<Immediate>` for use with `clearImmediate`.
-   `clearTimeout(timeout)`
-   `clearInterval(timeout)`
-   `clearImmediate(immediate)`

## Understanding `setImmediate()`

-   When you want to execute some piece of code asynchronously, but as soon as possible, one option is to use the `setImmediate()` function.
-   Any function passed as the `setImmediate()` argument is a callback that's executed in the next iteration of the event loop.

### How is `setImmediate()` different from `setTimeout(() => {}, 0)`, and from `process.nextTick()` and `promise.then()`?

-   A function passed to `process.nextTick()` is going to be executed on the current iteration of the event loop, after the current operation ends. This means it will always execute before `setTimeout` and `setimmediate`.
-   A `setTimeout()` callback with 0 ms delay is very similar to `setImmediate()`. The execution order will depend on various factors, but they will be both run in the next iteration of the event loop.
-   A `process.nextTick` callback is added to `process.nextTick queue`. A `Promise.then()` callback is added to `promises mictrotask queue`. A `setTimeout`, `setImmediate` callback is added to the `macrotask queue`.
-   Event loop executes task in `process.nextTick queue` first, and then executes `promise microtask queue` and then executes `macrotask queue`.

[timers1.js](./timers1.js) and [timers2.js](./timers2.js) are the 2 examples of the timers.
