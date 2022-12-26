var events = require('events');
var fs = require('fs');
var readline = require('readline');

var assembler = require('./main.js');

if (process.argv.length < 3) {
	throw Error("Filename not supplied.");
}
var filename = process.argv[2];

async function run() {
	try {
		var rl = readline.createInterface({
			input: fs.createReadStream(filename),
			crlfDelay: Infinity
		});

		rl.on('line', line => {
			console.log(assembler.assemble(line), line);
		});

		await events.once(rl, 'close');
	}
	catch (err) {
		console.error(err);
	}
}

run();
