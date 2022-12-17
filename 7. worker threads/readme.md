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

### Complex calculations without blocking the Event Loop

Suppose you want to do complex calculations in JavaScript without blocking the Event Loop. You have two options: **partitioning** or **offloading**.

#### Partitioning

You could partition your calculations so that each runs on the Event Loop but regularly yields (gives turns to) other pending events. In JavaScript it's easy to save the state of an ongoing task in a closure, as shown in example 2 below.
<br>

For a simple example, suppose you want to compute the average of the numbers `1` to `n`.

**Example 1: Un-partitioned average, costs `O(n)`**

```
for(let i=0; i<n; i++)
    sum += i;
let avg = sum / n;
console.log('avg: ' + avg);
```

**Example 2: Partitioned average, each of the `n` asynchronous steps costs `O(1)`.**

```
function asyncAvg(n, avgCB){
    var sum = 0; //Save ongoing sum in JS closure.
    function help(i, cb){
        sum += i;
        if(i == n){
            cb(sum);
            return;
        }

        setImmediate(help.bind(null, i+1, cb)); // "Asynchronous recursion" - Schedule next operation asynchronously.
    }

    help(1, function(sum){ //Start the helper, with CB to call avgCB.
        var avg = sum/n;
        avgCB(avg);
    });
}

asyncAvg(n, function(avg){
    console.log('AVG OF 1-n: ' + avg);
});
```

You can apply this principle to array iterations and so forth.

#### Offloading

If you need to do something more complex, partitioning is not a good option. This is because partitioning uses only the Event Loop, and you won't benefit from multiple cores almost certainly available on your machine. Remember, the Event Loop should orchestrate client requests, not fulfill them itself. For a complicated task, move the work off of the Event Loop onto a Worker Pool.

##### How to offload

You have two options for a destination Worker Pool to which to offload work.

-   You can use the built-in Node.js Worker Pool by developing a **C++ addon**. On older versions of Node, build your C++ addon using **NAN**, and on newer versions use **N-API**. **node-webworker-threads** offers a JavaScript-only way to access the Node.js Worker Pool.
-   You can create and manage your own Worker Pool dedicated to computation rather than the Node.js I/O-themed Worker Pool. The most straightforward ways to do this is using **Child Process** or **Cluster**.

You should not simply create a Child Process for every client. You can receive client requests more quickly than you can create and manage children, and your server might become a **fork bomb**.

##### Downside of offloading

The downside of the offloading approach is that it incurs overhead in the form of communication costs. Only the Event Loop is allowed to see the "namespace" (JavaScript state) of your application. From a Worker, you cannot manipulate a JavaScript object in the Event Loop's namespace. Instead, you have to serialize and deserialize any objects you wish to share. Then the Worker can operate on its own copy of these object(s) and return the modified object (or a "patch") to the Event Loop.

##### Some suggestions for offloading

You may wish to distinguish between CPU-intensive and I/O-intensive tasks because they have markedly different characteristics.

-   A CPU-intensive task only makes progress when its Worker is scheduled, and the Worker must be scheduled onto one of your machine's logical cores. If you have 4 logical cores and 5 Workers, one of these Workers cannot make progress. As a result, you are paying overhead (memory and scheduling costs) for this Worker and getting no return for it.
-   I/O-intensive tasks involve querying an external service provider (DNS, file system, etc.) and waiting for its response. While a Worker with an I/O-intensive task is waiting for its response, it has nothing else to do and can be de-scheduled by the operating system, giving another Worker a chance to submit their request. Thus, I/O-intensive tasks will be making progress even while the associated thread is not running. External service providers like databases and file systems have been highly optimized to handle many pending requests concurrently. For example, a file system will examine a large set of pending write and read requests to merge conflicting updates and to retrieve files in an optimal order (e.g. see these slides).

If you rely on only one Worker Pool, e.g. the Node.js Worker Pool, then the differing characteristics of CPU-bound and I/O-bound work may harm your application's performance.
<br>

For this reason, you might wish to maintain a separate Computation Worker Pool.

##### Offloading: conclusions

For simple tasks, like iterating over the elements of an arbitrarily long array, partitioning might be a good option. If your computation is more complex, offloading is a better approach: the communication costs, i.e. the overhead of passing serialized objects between the Event Loop and the Worker Pool, are offset by the benefit of using multiple cores.
<br>

However, if your server relies heavily on complex calculations, you should think about whether Node.js is really a good fit. Node.js excels for I/O-bound work, but for expensive computation it might not be the best option.
<br>

If you take the offloading approach, see the section on not blocking the Worker Pool (below section).

## Don't block the Worker Pool

Node.js has a Worker Pool composed of `k` Workers. If you are using the Offloading paradigm discussed above, you might have a separate Computational Worker Pool, to which the same principles apply. In either case, let us assume that `k` is much smaller than the number of clients you might be handling concurrently. This is in keeping with the **"one thread for many clients"** philosophy of Node.js, the secret to its scalability.
<br>

As discussed above, each Worker completes its current Task before proceeding to the next one on the Worker Pool queue.
<br>

Now, there will be variation in the cost of the Tasks required to handle your clients' requests. Some Tasks can be completed quickly (e.g. reading short or cached files, or producing a small number of random bytes), and others will take longer (e.g reading larger or uncached files, or generating more random bytes). Your goal should be to minimize the variation in Task times, and you should use Task partitioning to accomplish this.

### Minimizing the variation in Task times

If a Worker's current Task is much more expensive than other Tasks, then it will be unavailable to work on other pending Tasks. In other words, **each relatively long Task effectively decreases the size of the Worker Pool by one until it is completed.** This is undesirable because, up to a point, the more Workers in the Worker Pool, the greater the Worker Pool throughput (tasks/second) and thus the greater the server throughput (client requests/second). One client with a relatively expensive Task will decrease the throughput of the Worker Pool, in turn decreasing the throughput of the server.
<br>

To avoid this, you should try to minimize variation in the length of Tasks you submit to the Worker Pool. While it is appropriate to treat the external systems accessed by your I/O requests (DB, FS, etc.) as black boxes, you should be aware of the relative cost of these I/O requests, and should avoid submitting requests you can expect to be particularly long.
<br>

Two examples should illustrate the possible variation in task times.

-   **Variation example: Long-running file system reads**
    Suppose your server must read files in order to handle some client requests. After consulting the Node.js File system APIs, you opted to use `fs.readFile()` for simplicity. However, `fs.readFile()` is (currently) not partitioned: it submits a single `fs.read()` Task spanning the entire file. If you read shorter files for some users and longer files for others, `fs.readFile()` may introduce significant variation in Task lengths, to the detriment of Worker Pool throughput.
    <br>

    For a worst-case scenario, suppose an attacker can convince your server to read an arbitrary file (this is a **directory traversal vulnerability**). If your server is running Linux, the attacker can name an extremely slow file: `/dev/random`. For all practical purposes, `/dev/random` is infinitely slow, and every Worker asked to read from `/dev/random` will never finish that Task. An attacker then submits `k` requests, one for each Worker, and no other client requests that use the Worker Pool will make progress.

-   **Variation example: Long-running crypto operations**
    Suppose your server generates cryptographically secure random bytes using `crypto.randomBytes()`. `crypto.randomBytes()` is not partitioned: it creates a single `randomBytes()` Task to generate as many bytes as you requested. If you create fewer bytes for some users and more bytes for others, `crypto.randomBytes()` is another source of variation in Task lengths.

### Task partitioning

Tasks with variable time costs can harm the throughput of the Worker Pool. To minimize variation in Task times, as far as possible you should partition each Task into comparable-cost sub-Tasks. When each sub-Task completes it should submit the next sub-Task, and when the final sub-Task completes it should notify the submitter.
<br>

To continue the `fs.readFile()` example, you should instead use `fs.read()` (manual partitioning) or `ReadStream` (automatically partitioned).
<br>

The same principle applies to CPU-bound tasks; the `asyncAvg` example might be inappropriate for the Event Loop, but it is well suited to the Worker Pool.
<br>

When you partition a Task into sub-Tasks, shorter Tasks expand into a small number of sub-Tasks, and longer Tasks expand into a larger number of sub-Tasks. Between each sub-Task of a longer Task, the Worker to which it was assigned can work on a sub-Task from another, shorter, Task, thus improving the overall Task throughput of the Worker Pool.
<br>

Note that the number of sub-Tasks completed is not a useful metric for the throughput of the Worker Pool. Instead, concern yourself with the number of Tasks completed.

### Avoiding Task partitioning

Recall that the purpose of Task partitioning is to minimize the variation in Task times. If you can distinguish between shorter Tasks and longer Tasks (e.g. summing an array vs. sorting an array), you could create one Worker Pool for each class of Task. Routing shorter Tasks and longer Tasks to separate Worker Pools is another way to minimize Task time variation.
<br>

In favor of this approach, partitioning Tasks incurs overhead (the costs of creating a Worker Pool Task representation and of manipulating the Worker Pool queue), and avoiding partitioning saves you the costs of additional trips to the Worker Pool. It also keeps you from making mistakes in partitioning your Tasks.
<br>

The downside of this approach is that Workers in all of these Worker Pools will incur space and time overheads and will compete with each other for CPU time. Remember that each CPU-bound Task makes progress only while it is scheduled. As a result, you should only consider this approach after careful analysis.
<br>

### Worker Pool: conclusions

Whether you use only the Node.js Worker Pool or maintain separate Worker Pool(s), you should optimize the Task throughput of your Pool(s).
<br>

To do this, minimize the variation in Task times by using Task partitioning.
