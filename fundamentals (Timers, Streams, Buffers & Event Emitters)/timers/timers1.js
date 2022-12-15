console.log('script start');

const interval = setInterval(() => {
	console.log('setInterval');
}, 0);

setTimeout(() => {
	console.log('setTimeout1');
	Promise.resolve()
		.then(() => console.log('promise3'))
		.then(() => console.log('promise4'))
		.then(() => {
			setTimeout(() => {
				console.log('setTimeout2');
				Promise.resolve()
					.then(() => console.log('promise5'))
					.then(() => console.log('promise6'))
					.then(() => clearInterval(interval));
			}, 0);
		});
}, 0);

Promise.resolve()
	.then(() => console.log('promise1'))
	.then(() => console.log('promise2'));

// This will log:
// script start
// promise1
// promise2
// setInterval
// setTimeout1
// promise3
// promise4
// setInterval
// setTimeout2
// promise5
// promise6
