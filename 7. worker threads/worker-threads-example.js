const { Worker } = require('worker_threads');
const path = require('path');

function runService(workerData) {
	return new Promise((resolve, reject) => {
		const worker = new Worker(path.join(__dirname, 'worker.js'), {
			workerData,
		});
		worker.on('message', resolve);
		worker.on('error', reject);
		worker.on('exit', code => {
			if (code != 0)
				reject(
					new Error(
						`Stopped the Worker Thread with the exit code ${code}`
					)
				);
		});
	});
}

async function run() {
	const result = await runService('CoderChirag');
	console.log(result);
}

run().catch(err => console.error(err));
