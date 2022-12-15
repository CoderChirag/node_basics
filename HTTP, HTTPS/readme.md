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
