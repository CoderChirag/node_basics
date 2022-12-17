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
