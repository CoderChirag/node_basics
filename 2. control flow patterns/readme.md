# Control Flow patterns

-   There are 2 types of API functions in Node.js :

    -   **asynchronous**, non-blocking functions. eg, `fs.readFile(filename[,encoding[,callback]])`.
    -   **synchronous**, blocking functions. eg, `fs.readFileSync(filename[,encoding])`.

-   Writing **synchronous** code is not problematic: we can draw on our experience in other languages to structure it appropriately using keywords like `if`, `else`, `for`, `while`, and `switch`.
-   It is the way we should structure asynchronous calls which is most problematic, because established practices do not help here. For eg, we'd like to read a thousand text files. Take the following naive code:

    ```
    for(var i=1; i<1000; i++){
      fs.readFile('./',+ i + '.txt', function(){
          //do something with the file
      });
    }
    do_next_part();
    ```

    -   This code would start 1000 simultaneous asynchronous fille reads, and run the `do_next_part()` function immediately.
    -   This has several problems :
        -   First, we'd like to wait untill all the file reads are done untill going any further.
        -   Second, launching a thousand file reads simultaneously will quickly exhaust the no. of available file handles.
        -   Third, we do not have a way to accumulate the result for do_next_part().
    -   We need :
        -   a way to control the order in which the file reads are done.
        -   some way to collect the result data for processing.
        -   some way to restrict the concurrency of the file read operations to conserve limited system resources.
        -   a way to determine when all the reads necessary for the `do_next_part()` are completed.

-   **Control Flow** functions enables us to do this in Node.js/
    -   A **Control Flow** function is a lightweight, generic piece of code which runs in between several asynchronous function calls and which take care of the necessary houskeeping to :
        -   control the order of execution.
        -   collect data.
        -   limit concurrency, and
        -   call the next step in the program.
    -   There are 3 basic patterns for this :
        -   **Series** - Sequential execution without any concurrency maintainning the correct order of execution. Eg, we need to do 5 database queries, and each of those queries needs data from the previous query. See the sample code in [series.js](./series.js).
        -   **Full Parallel** - Complete parallel execution with full concurrency and no guarantee of order of execution. Eg, triggering emails to the given list of many users. See the sample code in [parallel.js](./parallel.js).
        -   **Limited Parallel** - Parallel execution with a max limit of concurrency and no guanrantee of order of execution. Eg, we need to some I/O operations parallely, but have to keep the number of running I/O operatrions under a set limit. See the sample code in [limited_parallel.js](./limited_parallel.js).
