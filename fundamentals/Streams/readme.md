# Streams

-   Streams are the 4th alternative way of accessing data from various sources such as the network (TCP/UDP), files, child processes and user inputm, after the 3 control flow patterns discussed in [control flow patterns](../../control%20flow%20patterns/readme.md).
-   Node offers us multiple options for accessing the data :
    | | Synchronous | Asynchronous
    | --- | --- | ---
    | Fully Buffered | `readFileSync()` | `readFile()`
    | Partially Buffered (streaming) | `readSync()` | `read()`, `createReadStream()`

-   The difference b/w these is how the data is exposed, and the amount of memory used to stream the data.
