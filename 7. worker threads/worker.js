const { workerData, parentPort } = require('worker_threads');

console.log('Worker Thread implementation by ' + workerData);

parentPort.postMessage({ fileName: workerData, status: 'Done' });
