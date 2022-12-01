function series(callbacks, last) {
	let results = [];
	function next() {
		let callback = callbacks.shift();
		if (callback) {
			callback(function () {
				results.push(Array.prototype.slice.call(arguments));
				next();
			});
		} else {
			last(results);
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

series(
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
