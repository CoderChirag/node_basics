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

### The Server Request Object - `http.ServerRequest`

-   ServerRequest are **Readable Streams**, so we can bind to the `'data'` and `'end'` events to access the request data.
-   The Request object contains 3 intersting properties:
    -   `request.method` - The request method as a string. **Read Only.** Example: `'GET'`, `'POST'` etc.
    -   `request.url` - Request URL string. Example: `'/'`, `'/user/1'`, `'/post/new/?param=value'`
    -   `request.headers` - A **read only** object, indexed by the name of the header (converted to lowecase), containing the values of the headers.
-   Example `http.ServerRequest` object:
    ```
    {
        socket: {...},
        connection: {...},
        httpVersion: '1.1',
        complete: false,
        headers: {
            host: 'localhost:8080',
            connection: 'keep-alive',
            'cache-control': 'max-age=0',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) ...',
            accept: 'application/xml, application/xhtml+xml ...',
            'accept-encoding': 'gzip,deflate,sdch',
            'accept-language': 'en-US,en;q=0.8',
            'accept-charset': 'ISO-8859-1,utf-8,q=0.7,;q=0.3'
        },
        trailers: {...},
        readable: true,
        url: '/',
        method: 'GET',
        statusCode: null,
        client: {...},
        httpVersionMajor: 1,
        httpVersionMinor: 1,
        upgrade: false
    }
    ```

#### Parsing Data

-   There are several different formats through which an HTTP server can recieve requests.
-   The most commonly used formats are:
    -   `HTTP GET` - passed via `request.url`
    -   `HTTP POST` requests - passed as `'data'` events
    -   `cookies` - passed via `request.headers.cookies`

##### Parsing `GET` requests

-   The `request.url` parameter contains the URL for the current request.
-   The **URL module** provides 3 functions which can be used to work with URLs:
    -   `url.parse(urlStr, parseQueryString=false`)` - Parses a URL string and returns an object which contains the various parts of the URL.
    -   `url.format(urlObj)`: Accepts a parsed URL object ans returns the string. Basically, does the reverse of `url.parse()`.
    -   `url.resolve(from, to)`: Resolves a given URL relative to base URL as a browser would for an anchor tag.
-   ```
      var url = require('url');
      console.log(url.parse('http://user:pass@host.com:8080/p/a/t/h?query=string#hash', true)); // By passing true as 2nd parameter, you get an additional "query" key that contains the parsed query string.

      // Returns the following object:
      {
          href: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash',
          protocol: 'http:',
          host: 'userLpass@host.com:8080',
          auth: 'user:pass',
          hostname: 'host.com',
          port: '8080',
          pathname: '/p/a/t/h',
          search: '?query=string',
          query: {
              query: 'string'
          },
          hash: '#hash',
          slashes: true
      }
    ```
