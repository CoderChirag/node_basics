function parallel(callbacks, last) {
	let results = [];
	let count = 0;
	callbacks.forEach(function (callback, index) {
		callback(function () {
			results[index] = Array.prototype.slice.call(arguments);
			count++;
			if (count === callbacks.length) {
				last(results);
			}
		});
	});
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

parallel(
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
