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
