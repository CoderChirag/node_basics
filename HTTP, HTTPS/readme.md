# Node.js: HTTP, HTTPS

## HTTP Server

### Methods

-   `http.createServer([requestListener])`
-   `server.listen(port[, hostname[, callback]])`
-   `server.close()`

### Events

-   `'request'`
-   `'connection'`
-   `'close'`
-   `'checkContinue'`
-   `'upgrade'`
-   `'clientError'`

### Server Request (http.ServerRequest) - Readable Stream

#### Methods

-   `setEncoding(encoding=null)`
-   `pause()`
-   `resume()`

#### Events

-   `'data'`
-   `'end'`
-   `'close'`

#### Properties

-   `method`
-   `url`
-   `headers`
-   `trailers`
-   `httpVersion`
-   `connection`

### Server Response (http.ServerResponse) - Writable Stream

#### Methods

-   `writeContinue()`
-   `writeHead(statusCode[, reasonPhrase[, headers]])`
-   `setHeader(name, value)`
-   `getHeader(name)`
-   `removeHeader(name)`
-   `write(chunk, encoding='utf-8')`
-   `addTrailers(headers)`
-   `end(data[, encoding])`

#### Properties

-   `statusCode`

### Creating HTTP Server

-   Creating an HTTP server is simple: after requiring the http module, you call `createServer()`, then instruct the server to listen on a particular port:
    ```
    var http = require('http');
    var server = http.createServer(function(request, response){
        //Read the request, amd write back to the response
    });
    server.listen(8080, 'localhost');
    ```
-   Callback function is called every time a client makes a request to the server.
-   The server object returned by the `http.createServer()` is an **EventEmitter** - so we can also bind new request handlers using the `server.on()`:
    ```
    // create a server with no callback bound to 'request'
    var server = http.createServer().listen(8080, 'localhost');
    // bind a listener to the 'request' event
    server.on('request', function(req, res){
        // do something with the request
    });
    ```
