# Worker Threads

The `node:worker_threads` module enables the use of threads that execute JavaScript in parallel. To access it:

```
const worker = require('worker_threads');
```

Workers (threads) are useful for performing CPU-intensive JavaScript operations. They do not help much with I/O-intensive work. The Node.js built-in asynchronous I/O operations are more efficient than Workers can be.
<br>

Unlike `child_process` or `cluster`, `worker_threads` can share memory. They do so by transferring `ArrayBuffer` instances or sharing `SharedArrayBuffer` instances.

```
const {
    Worker, isMainThread, parentPort, workerData,
} = require('worker_threads');

if(isMainThread){
    module.exports = function parseJSAsync(script){
        return new Promise((resolve, reject) => {
            const worker = new Worker(__filename, {
                workerData: script,
            });
            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if(code != 0)
                    reject(new Error(`Worker stopped with the exit code ${code}`));
            });
        });
    };
}else{
    const {parse} = require('some-js-parsing-library');
    const script = workerData;
    parenPort.postMessage(parse(script));
}
```

The above example spawns a Worker thread for each `parseJSAsync()` call. In practice, use a pool of Workers for these kinds of tasks. Otherwise, the overhead of creating Workers would likely exceed their benefit.

## Example Implementation

Create two files for implementing the thread as shown below:

```
// worker.js
const {workerData, parentPort} = require('worker_threads');

console.log('Worker Thread implementation by' + workerData);

parentPort.postMessage({fileName: workerData, status: 'Done'});
```

Here, the `workerData` and `parentPort` are part of Worker Thread. The `workerData` is used for fetching the data from the thread and `parentPort` is used for manipulating the thread. The `postMessage()` method is used for posting the given message in the console by taking the filename as fetched by `workerData`.

```
// worker-threads-example.js
const { Worker } = require('worker_threads');

function runService(workerData){
    return new Promise((resolve, reject) => {
        const worker = new Worker('./worker.js', {workerData});
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if(code != 0)
                reject(new Error(`Stopped the Worker Thread with the exit code ${code}`));
        });
    });
}

async function run(){
    const result = await runService('CoderChirag');
    console.log(result);
}
run().catch(err => console.error(err));
```

Here, the function `runService()` return a Promise and runs the worker thread. The function `run()` is used for calling the function `runService()` and giving the value for `workerData`.
To run:

```
$ node worker-threads-example.js
Worker Thread implementation by CoderChirag
{fileName: 'CoderChirag', status: 'Done'}
```

The code for this is given in files [worker-threads-example.js](./worker-threads-example.js) and [worker.js](./worker.js).

# Don't Block the Event Loop (or the Worker Pool)

## The Worker Pool

Node.js runs JavaScript code in the Event Loop (initialization and callbacks), and offers a **Worker Pool** to handle expensive tasks like file I/O. Node.js scales well, sometimes better than more heavyweight approaches like Apache. **The secret to the scalability of Node.js is that it uses a small number of threads to handle many clients.** If Node.js can make do with fewer threads, then it can spend more of your system's time and memory working on clients rather than on paying space and time overheads for threads (memory, context-switching). But because Node.js has only a few threads, you must structure your application to use them wisely.
<br>

Here's a good rule of thumb for keeping your Node.js server speedy: Node.js is fast when the work associated with each client at any given time is "small".
<br>

This applies to callbacks on the Event Loop and tasks on the Worker Pool.

## Why should I avoid blocking the Event Loop and the Worker Pool?

Node.js uses a small number of threads to handle many clients (by default 4 threads). In Node.js there are two types of threads:

-   one **Event Loop** (aka the **main loop**, **main thread**, **event thread**, etc.),
-   and a pool of `k` Workers in a **Worker Pool** (aka the **threadpool**).

If a thread is taking a long time to execute a callback (Event Loop) or a task (Worker), we call it **"blocked"**. While a thread is blocked working on behalf of one client, it cannot handle requests from any other clients. This provides two motivations for blocking neither the Event Loop nor the Worker Pool:

-   **Performance:** If you regularly perform heavyweight activity on either type of thread, the throughput (requests/second) of your server will suffer.
-   **Security:** If it is possible that for certain input one of your threads might block, a malicious client could submit this "evil input", make your threads block, and keep them from working on other clients. This would be a **Denial of Service** attack.

## A quick review of Node

Node.js uses the Event-Driven Architecture: it has an Event Loop for orchestration and a Worker Pool for expensive tasks.

### What code runs on the Event Loop?

When they begin, Node.js applications first complete an initialization phase, `require`'ing modules and registering callbacks for events. Node.js applications then enter the Event Loop, responding to incoming client requests by executing the appropriate callback. This callback executes synchronously, and may register asynchronous requests to continue processing after it completes. The callbacks for these asynchronous requests will also be executed on the Event Loop.
<br>

The Event Loop will also fulfill the non-blocking asynchronous requests made by its callbacks, e.g., network I/O.
<br>

In summary, **the Event Loop executes the JavaScript callbacks registered for events**, and is **also responsible for fulfilling non-blocking asynchronous requests like network I/O**.

### What code runs on the Worker Pool?

The Worker Pool of Node.js is implemented in libuv, which exposes a general task submission API.
<br>

**Node.js uses the Worker Pool to handle "expensive" tasks**. This includes **I/O for which an operating system does not provide a non-blocking version**, as well as particularly **CPU-intensive tasks**.
<br>

These are the Node.js module APIs that make use of this Worker Pool:

1. **I/O-intensive**
    1. **DNS:** `dns.lookup()`, `dns.lookupService()`.
    2. **File System:** All file system APIs except `fs.FSWatcher()` and those that are explicitly synchronous use libuv's threadpool.
2. **CPU-intensive**
    1. **Crypto:** `crypto.pbkdf2()`, `crypto.scrypt()`, `crypto.randomBytes()`, `crypto.randomFill()`, `crypto.generateKeyPair()`.
    2. **Zlib:** All zlib APIs except those that are explicitly synchronous use libuv's threadpool.

In many Node.js applications, these APIs are the only sources of tasks for the Worker Pool. Applications and modules that use a C++ add-on can submit other tasks to the Worker Pool.
<br>

For the sake of completeness, we note that when you call one of these APIs from a callback on the Event Loop, the Event Loop pays some minor setup costs as it enters the Node.js C++ bindings for that API and submits a task to the Worker Pool. These costs are negligible compared to the overall cost of the task, which is why the Event Loop is offloading it. When submitting one of these tasks to the Worker Pool, Node.js provides a pointer to the corresponding C++ function in the Node.js C++ bindings.

### How does Node.js decide what code to run next?

Abstractly, the Event Loop and the Worker Pool maintain queues for pending events and pending tasks, respectively.
<br>

In truth, the Event Loop does not actually maintain a queue. Instead, it has a collection of file descriptors that it asks the operating system to monitor, using a mechanism like **epoll** (Linux), **kqueue** (OSX), **event ports** (Solaris), or **IOCP** (Windows). These file descriptors correspond to network sockets, any files it is watching, and so on. When the operating system says that one of these file descriptors is ready, the Event Loop translates it to the appropriate event and invokes the callback(s) associated with that event.
<br>

In contrast, the Worker Pool uses a real queue whose entries are tasks to be processed. A Worker pops a task from this queue and works on it, and when finished the Worker raises an **"At least one task is finished"** event for the Event Loop.

### What does this mean for application design?

In a one-thread-per-client system like Apache, each pending client is assigned its own thread. If a thread handling one client blocks, the operating system will interrupt it and give another client a turn. The operating system thus ensures that clients that require a small amount of work are not penalized by clients that require more work.
<br>

Because Node.js handles many clients with few threads, if a thread blocks handling one client's request, then pending client requests may not get a turn until the thread finishes its callback or task. **The fair treatment of clients is thus the responsibility of your application.** This means that you shouldn't do too much work for any client in any single callback or task.
<br>

This is part of why Node.js can scale well, but it also means that you are responsible for ensuring fair scheduling.

## Don't block the Event Loop

The Event Loop notices each new client connection and orchestrates the generation of a response. All incoming requests and outgoing responses pass through the Event Loop. This means that if the Event Loop spends too long at any point, all current and new clients will not get a turn.
<br>

You should make sure you never block the Event Loop. In other words, each of your JavaScript callbacks should complete quickly. This of course also applies to your `await`'s, your `Promise.then`'s, and so on.
<br>

A good way to ensure this is to reason about the **"computational complexity"** of your callbacks. If your callback takes a constant number of steps no matter what its arguments are, then you'll always give every pending client a fair turn. If your callback takes a different number of steps depending on its arguments, then you should think about how long the arguments might be.
<br>

**Example 1: A constant-time callback.**

```
app.get('/constant-time', (req, res) => {
  res.sendStatus(200);
});
```

**Example 2: An `O(n)` callback. This callback will run quickly for small `n` and more slowly for large `n`.**

```
app.get('/countToN', (req, res) => {
  let n = req.query.n;

  // n iterations before giving someone else a turn
  for (let i = 0; i < n; i++) {
    console.log(`Iter ${i}`);
  }

  res.sendStatus(200);
});
```

**Example 3: An `O(n^2)` callback. This callback will still run quickly for small `n`, but for large `n` it will run much more slowly than the previous `O(n)` example.**

```
app.get('/countToN2', (req, res) => {
  let n = req.query.n;

  // n^2 iterations before giving someone else a turn
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      console.log(`Iter ${i}.${j}`);
    }
  }

  res.sendStatus(200);
});
```

### How careful should you be?

Node.js uses the Google V8 engine for JavaScript, which is quite fast for many common operations. Exceptions to this rule are regexps and JSON operations, discussed below.
<br>

However, for complex tasks you should consider bounding the input and rejecting inputs that are too long. That way, even if your callback has large complexity, by bounding the input you ensure the callback cannot take more than the worst-case time on the longest acceptable input. You can then evaluate the worst-case cost of this callback and determine whether its running time is acceptable in your context.
