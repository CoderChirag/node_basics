---
Title: Our Example - I/O function call
Created: September 2, 2023 12:15 AM
Updated: September 2, 2023 12:19 AM
Parent-item: ../ 
---
# Our Example - I/O function call

In order to achieve our goal of understanding nodejs (and to have a clear roadmap of what we're going to do), we'll start by writing a simple program which reads a file and prints it to the screen. You'll see that this code will not be the optimal code a programmer can write, but it'll fulfill the purpose of being an object of study for all the parts we are supposed to go through.

If you take a closer look at the [Node.js source](https://github.com/nodejs/node), you'll notice two main folders: `lib` and `src`. The `lib` folder is the one that contains all the **JavaScript** definitions of all functions and modules we require into our projects. The `src` folder is the **C++ implementations** that comes along with them, this is where Libuv and V8 resides, where all the implementations for modules like `fs`, `http`, `crypto` and others end up residing.

Let there be this simple program:

```node
const fs = require('fs')
const path = require('path')
const filePath = path.resolve(`../myDir/myFile.md`)

// Parses the buffer into a string
function callback (data) {
  return data.toString()
}

// Transforms the function into a promise
const readFileAsync = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) return reject(err)
      return resolve(callback(data))
    })
  })
}

(() => {
  readFileAsync(filePath)
    .then(console.log)
    .catch(console.error)
})()
```

All the examples we'll have in this article will be related to this program. And this is due to the fact that `fs.readFile` is **not** either part of V8 or JavaScript. This function is solely implemented by Node.js as a C++ binding to the local OS, however, the high-level API we use as `fs.readFile(path, cb)` is fully implemented in JavaScript, which calls those bindings. Here's the full source code of this specific `readFile` function (because the whole file is 1850 lines long, but it's in the references):

```node
// https://github.com/nodejs/node/blob/0e03c449e35e4951e9e9c962ff279ec271e62010/lib/fs.js#L46
const binding = internalBinding('fs');
// https://github.com/nodejs/node/blob/0e03c449e35e4951e9e9c962ff279ec271e62010/lib/fs.js#L58
const { FSReqCallback, statValues } = binding;

// https://github.com/nodejs/node/blob/0e03c449e35e4951e9e9c962ff279ec271e62010/lib/fs.js#L283
function readFile(path, options, callback) {
  callback = maybeCallback(callback || options);
  options = getOptions(options, { flag: 'r' });
  if (!ReadFileContext)
    ReadFileContext = require('internal/fs/read_file_context');
  const context = new ReadFileContext(callback, options.encoding);
  context.isUserFd = isFd(path); // File descriptor ownership

  const req = new FSReqCallback();
  req.context = context;
  req.oncomplete = readFileAfterOpen;

  if (context.isUserFd) {
    process.nextTick(function tick() {
      req.oncomplete(null, path);
    });
    return;
  }

  path = getValidatedPath(path);
  binding.open(pathModule.toNamespacedPath(path),
               stringToFlags(options.flag || 'r'),
               0o666,
               req);
}
```

> Disclaimer: I'm pasting the code references in the github source links as of the commit 0e03c449e35e4951e9e9c962ff279ec271e62010 which is the latest right now, this way this document will always point to the right implementation in the time I wrote it.
> 

See line 5? We have a require call to `read_file_context`, another JS file (which is in the references as well). In the end of the `fs.readFile` [source code](https://github.com/nodejs/node/blob/0e03c449e35e4951e9e9c962ff279ec271e62010/lib/fs.js), we have a call to `binding.open`, which is a C++ call to open a file descriptor, passing the path, the C++ `fopen` flags, the file mode permissions in octal format (`0o` [is octal in ES6](https://2ality.com/2015/04/numbers-math-es6.html)) and, lastly, the `req` variable which is the async callback function which will receive our file context.

Along with all that, we have the `internalBinding`, which is the private internal C++ binding loader, this is not accesible to the end users (like us) because they're available through `NativeModule.require`, this is the thing that actually loads C++ code. And this is where we are [depend on V8, A LOT](https://github.com/nodejs/node/blob/0e03c449e35e4951e9e9c962ff279ec271e62010/src/node_file.cc#L54-L79).

So, basically, in the code above, we're requiring a `fs` binding with `internalBinding('fs')`, which calls and loads the `[src/node_file.cc](https://github.com/nodejs/node/blob/0e03c449e35e4951e9e9c962ff279ec271e62010/src/node_file.cc)` (because this whole file is in the `[namespace fs](https://github.com/nodejs/node/blob/0e03c449e35e4951e9e9c962ff279ec271e62010/src/node_file.cc#L52)`) file that contains all the C++ implementations for our `FSReqCallback` and `statValues` functions.

The function `FSReqCallback` is the async callback used when we call `fs.readFile` (when we use `fs.readFileSync` there's another function called `FSReqWrapSync` which is defined [here](https://github.com/nodejs/node/blob/0e03c449e35e4951e9e9c962ff279ec271e62010/src/node_file.cc#L681)) and all its methods and implementations are defined [here](https://github.com/nodejs/node/blob/0e03c449e35e4951e9e9c962ff279ec271e62010/src/node_file.cc#L449-L475) and exposed as bindings [here](https://github.com/nodejs/node/blob/0e03c449e35e4951e9e9c962ff279ec271e62010/src/node_file.cc#L2218-L2228):

```cpp
// https://github.com/nodejs/node/blob/0e03c449e35e4951e9e9c962ff279ec271e62010/src/node_file.cc

FileHandleReadWrap::FileHandleReadWrap(FileHandle* handle, Local<Object> obj)
  : ReqWrap(handle->env(), obj, AsyncWrap::PROVIDER_FSREQCALLBACK),
    file_handle_(handle) {}

void FSReqCallback::Reject(Local<Value> reject) {
  MakeCallback(env()->oncomplete_string(), 1, &reject);
}

void FSReqCallback::ResolveStat(const uv_stat_t* stat) {
  Resolve(FillGlobalStatsArray(env(), use_bigint(), stat));
}

void FSReqCallback::Resolve(Local<Value> value) {
  Local<Value> argv[2] {
    Null(env()->isolate()),
    value
  };
  MakeCallback(env()->oncomplete_string(),
               value->IsUndefined() ? 1 : arraysize(argv),
               argv);
}

void FSReqCallback::SetReturnValue(const FunctionCallbackInfo<Value>& args) {
  args.GetReturnValue().SetUndefined();
}

void NewFSReqCallback(const FunctionCallbackInfo<Value>& args) {
  CHECK(args.IsConstructCall());
  Environment* env = Environment::GetCurrent(args);
  new FSReqCallback(env, args.This(), args[0]->IsTrue());
}

// Create FunctionTemplate for FSReqCallback
Local<FunctionTemplate> fst = env->NewFunctionTemplate(NewFSReqCallback);
fst->InstanceTemplate()->SetInternalFieldCount(1);
fst->Inherit(AsyncWrap::GetConstructorTemplate(env));
Local<String> wrapString =
    FIXED_ONE_BYTE_STRING(isolate, "FSReqCallback");
fst->SetClassName(wrapString);
target
    ->Set(context, wrapString,
          fst->GetFunction(env->context()).ToLocalChecked())
    .Check();
```

In this last bit, there's a constructor definition: `Local<FunctionTemplate> fst = env->NewFunctionTemplate(NewFSReqCallback)`. This basically says that when we call `new FSReqCallback()` the `NewFSReqCallback` will be called. Now see how the `context` property appears in the `target->Set(context, wrapString, fst->GetFunction)` part, and also how `oncomplete` also is defined and used on the `::Reject` and `::Resolve`.

It is also valuable to note that the `req` variable is built upon the result of the `new ReadFileContext` call, which is referenced as `context` and set as `req.context`. This means that the `req` variable is also a C++ binding representation of a request callback built with the function `FSReqCallback()` and setting its context to our callback and listening to an `oncomplete` event.

[credits]: 

- [https://github.com/khaosdoctor/my-notes/blob/master/node/node-under-the-hood.md#what-is-nodejs](https://github.com/khaosdoctor/my-notes/blob/master/node/node-under-the-hood.md#what-is-nodejs)