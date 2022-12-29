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
			var bytes = assembler.assemble(line);
			if (bytes.length > 0) {
				var s = bytes.map(n => n.toString(16).padStart(2, '0')).join(' ');
				console.log(s.padEnd(12, ' '), line);
			}
		});

		await events.once(rl, 'close');
	}
	catch (err) {
		console.error(err);
	}
}

run();
