function limited_parallel(limit, callbacks, last) {
	let results = [];
	let running = 1;
	let task = 0;
	function next() {
		running--;
		if (task === callbacks.length && running === 0) last(results);
		while (running < limit && callbacks[task]) {
			let callback = callbacks[task];
			(function (index) {
				callback(function () {
					results[index] = Array.prototype.slice.call(arguments);
					next();
				});
			})(task);
			task++;
			running++;
		}
	}
	next();
}

// Example Task

function async(arg, callback) {
	console.log("do something with '" + arg + "', return 1 sec later");
	setTimeout(function () {
		callback(arg);
	}, 1000);
}

function final(results) {
	console.log('Done', results);
}

limited_parallel(
	2,
	[
		function (next) {
			async(1, next);
		},
		function (next) {
			async(2, next);
		},
		function (next) {
			async(3, next);
		},
		function (next) {
			async(4, next);
		},
		function (next) {
			async(5, next);
		},
		function (next) {
			async(6, next);
		},
	],
	final
);
