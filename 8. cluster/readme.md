# Cluster

Clusters of Node.js processes can be used to run multiple instances of Node.js that can distribute workloads among their application threads. When process isolation is not needed, use the `worker_threads` module instead, which allows running multiple application threads within a single Node.js instance.
<br>

In Node.js, a **Cluster** is a way to create a group of worker processes that all share the same server port. Clustering can be used to improve the performance of a Node.js application by allowing it to take advantage of multiple CPU cores and distribute the load across multiple processes.

The cluster module allows easy creation of child processes that all share server ports.

```
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const process = require('process');

if(cluster.isPrimary){
    console.log(`Primary ${process.pid} is running`);

    // Fork workers.
    for(let i=0; i<numCPUs; i++){
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
}else{
    // Workers can share any TCP connection
    // In this case it is an HTTP Server
    http.createServer((req, res) => {
        res.writeHead(200);
        res.end('hello world\n');
    }).listen(8000);

    console.log(`Worker ${process.pid} started`);
}
```

Running Node.js will now share port 8000 between the workers:

```
$ node server.js
Primary 3596 is running
Worker 4324 started
Worker 4520 started
Worker 6056 started
Worker 5644 started
```

On Windows, it is not yet possible to set up a named pipe server in a worker.

## How it works

The worker processes are spawned using the `child_process.fork()` method, so that they can communicate with the parent via IPC and pass server handles back and forth.
<br>

The cluster module supports two methods of distributing incoming connections.

-   The first one (and the default one on all platforms except Windows) is the round-robin approach, where the primary process listens on a port, accepts new connections and distributes them across the workers in a round-robin fashion, with some built-in smarts to avoid overloading a worker process.
-   The second approach is where the primary process creates the listen socket and sends it to interested workers. The workers then accept incoming connections directly.

The second approach should, in theory, give the best performance. In practice however, distribution tends to be very unbalanced due to operating system scheduler vagaries. Loads have been observed where over 70% of all connections ended up in just two processes, out of a total of eight.
<br>

Because `server.listen()` hands off most of the work to the primary process, there are three cases where the behavior between a normal Node.js process and a cluster worker differs:

-   `server.listen({fd: 7})` Because the message is passed to the primary, **file descriptor 7 in the parent** will be listened on, and the handle passed to the worker, rather than listening to the worker's idea of what the number 7 file descriptor references.
-   `server.listen(handle)` Listening on handles explicitly will cause the worker to use the supplied handle, rather than talk to the primary process.
-   `server.listen(0)` Normally, this will cause servers to listen on a random port. However, in a cluster, each worker will receive the same "random" port each time they do `listen(0)`. In essence, the port is random the first time, but predictable thereafter. To listen on a unique port, generate a port number based on the cluster worker ID.

Node.js does not provide routing logic. It is therefore important to design an application such that it does not rely too heavily on in-memory data objects for things like sessions and login.
<br>

Because workers are all separate processes, they can be killed or re-spawned depending on a program's needs, without affecting other workers. As long as there are some workers still alive, the server will continue to accept connections. If no workers are alive, existing connections will be dropped and new connections will be refused. Node.js does not automatically manage the number of workers, however. It is the application's responsibility to manage the worker pool based on its own needs.
<br>

Although a primary use case for the `node:cluster` module is networking, it can also be used for other use cases requiring worker processes.
<br>
<br>

It's worth noting that clustering is just one way to improve the performance of a Node.js application by taking advantage of multiple CPU cores. There are other approaches, such as using the `worker_threads` module or the `threads` module, which can be used to offload CPU-intensive tasks to separate threads. The appropriate approach will depend on the specific requirements and constraints of your application.
