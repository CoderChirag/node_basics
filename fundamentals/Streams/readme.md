# Streams

-   Streams are the 4th alternative way of accessing data from various sources such as the network (TCP/UDP), files, child processes and user inputm, after the 3 control flow patterns discussed in [control flow patterns](../../control%20flow%20patterns/readme.md).
-   Node offers us multiple options for accessing the data :
    | | Synchronous | Asynchronous
    | --- | --- | ---
    | Fully Buffered | `readFileSync()` | `readFile()`
    | Partially Buffered (streaming) | `readSync()` | `read()`, `createReadStream()`

-   The difference b/w these is how the data is exposed, and the amount of memory used to stream the data.

## Fully buffered access

[100 Mb file]

1. [allocate 100Mb buffer]
2. [read and return 100 Mb buffer]

-   Fully buffered function calls like `readFileSync()` and `readFile()` expose the data as one big blob.
-   That is, reading is performed and then the full set of data is returned either in synchronous or asynchronous fashion.
-   We have to wait until all the data is read, and internally Node will need to allocate enough memory to store all the data in the memory.
-   Can be problematic therefore.

## Partially buffered access

[100 mb file]

1. [allocate small buffer]
2. [read and return small buffer]
3. [repeat 1&2 until done]

-   Does not treat data input as a discrete event, but rather as a series of events which occur as the data is being read or written.
-   Allows us to access data as it is being processed.
-   Partially buffered methods, such as `readSync()` and `read()` allow us to specify the size of the buffer, and read data in small chunks.
-   They allow for more control (eg, reading a file in non-linear order by skipping back and forth in the file).
