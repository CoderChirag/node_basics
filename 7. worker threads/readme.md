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
