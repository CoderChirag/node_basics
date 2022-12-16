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

##### Parsing `POST` requests

-   Post requests transmit thier data as the body of the request.
-   To access the data, you can buffer the data to a string in order to parse it.
-   The data is accessible through the `'data'` events emitted by the request. When all the data has been recieved, the `'end'` event is emitted:
    ```
    function parsePost(req, callback){
        var data = '';
        req.on('data', function(chunk){
            data += chunk;
        });
        req.on('end', function(){
            callback(data);
        });
    }
    ```
-   POST requests can be in multiple different encodings. The 2 most common encodings are:
    -   `application/x-www-form-urlencoded`
    -   `multipart/form-data`

###### `application/x-www-form-urlencoded`

-   `name=John+Doe&gender=male&family=5&city=kent&city=miami&other=abc%0D%0Adef&nickname`
-   Encoded like a `GET` request. It's the default encoding used for forms and used for most textual data.
-   The **QueryString module** provides 2 functions:
    -   `queryString.parse(str, sep='&amp', eq='=')` - Parses a `GET` query string and returns an object that contains the parameters as properties with values.
    -   `queryString.stringify(obj, sep='&amp', eq='=')` - Does the verse of `queryString.parse()`: takes an object with the properties and values and returns a string.
        ```
        var qs = require('querystring');
        var data = '';
        req.on('data', function(chunk){
            data += chunk;
        });
        req.on('end', function(){
            var post = qs.parse(data);
            console.log(post);
        })
        ```

###### `multipart/form-data`

-   ```
    Content-Type: multipart/form-data; boundary=AaB03x

    --AaB03x
    Content-Disposition: form-data; name="submit-name"

    Larry
    --AaB03x
    Content-Disposition: form-data; name="files"; filename="file1.txt"
    Content-Type: text/plain

    ... contents of the file1.txt ...
    --AaB03x--
    ```

-   `multipart/form-data` is used for **binary files**. This encoding is somewhat complicated to decode.

### The Server Response object - `http.ServerResponse`

-   The 2nd parameter of the request handler callback is a ServerResponse object.
-   ServerResponses are **Writable Streams**, so we `write()` data and call `end()` to finish the response.

#### Writing response data

-   The code below shows how you can write back data from the server.

    ```
    var http = require('http');
    var url = require('url');

    var server = http.createServer().listen(8080, 'localhost');
    server.on('request', function(req, res){
        var url_parts = url.parse(req.url, true);
        switch(url_parts.pathname){
            case '/':
            case '/index.html':
                res.write('<html><body>Hello!</body></html>');
                break;
            default:
                res.write('Unknown path: ' + JSON.stringify(url_parts));
        }
        res.end();
    });
    ```

    **Note :** `response.end()` must be called on each response to finish the response and close the connection.

#### Common response headers

-   Some common uses for **HTTP headers** include:
    -   Specifying the content type (**content-type**)
    -   Redirecting requests (**location**)
    -   Specifying the filename and size of a download (**content-disposition, content-length**)
    -   Setting cookies (**set-cookie**)
    -   Specifying compression (**content-encoding**)
    -   Controlling caching (**cache-control, expires, etag**)

##### Headers and `write()`

-   HTTP headers have to be sent before the request data is sent.
-   Headers can be written in 2 ways:
    -   **Explicitly** using `response.writeHead(statusCode[, reasonPhrase[, headers]])`. In this case, you have to specify all the headers in one go, along with the HTTP status code and an optional human-readable reasonPhrase.
    -   **Implicitly :** the first time `response.write()` is called, the current;y set implicit headers are sent. Methods for setting headers implicitly includes `response.statusCode = 200`, `response.setHeader(name, value)`, `response.getHeader(name)`, `response.removeHeader(name)`.

##### Setting the content/type header

-   Browsers expect to receive a content-type header for all the content.
-   This header contains the **MIME type** for the content/file that is sent, which is used to determine what the browser should do with the data (e.g. display it as an image).
-   Usually, the mime type is determined by the server based on the file extension:
    ```
    var map = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png'
    };
    var ext = '.css';
    if(map[ext]){
        console.log('Content-type', map[ext]);
    }
    ```
-   To set the content-type header from a filename:
    ```
    var ext = require('path').extname(filename);
    if(map[ext]){
        res.setHeader('Content-type', map[ext]);
    }
    ```

##### Redirecting to a different URL

-   Redirects are performed using the `Location` header. For example, to redirect to `/index.html`:
    ```
    res.statusCode = 302;
    res.setHeader('Location', '/index.html');
    res.end();
    ```
