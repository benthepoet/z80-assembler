var events = require('events');
var fs = require('fs');
var { open, write } = require('fs/promises');
var readline = require('readline');

var assembler = require('./main.js');

if (process.argv.length < 3) {
	throw Error("Filename not supplied.");
}
var src_filename = process.argv[2];

var bin_filename = null;
if (process.argv.length > 3) {
	bin_filename = process.argv[3];
}

var location_counter = 0;

async function run() {
	try {
		var rl = readline.createInterface({
			input: fs.createReadStream(src_filename),
			crlfDelay: Infinity
		});

		
		var bin_fd = null;
		if (bin_filename != null) {
			bin_fd = await open(bin_filename, 'w' );
		} 		

		rl.on('line', async (line) => {
			var bytes = assembler.assemble(line);
			if (bytes.length > 0) {
				if (bin_fd !== null) {
					var buf = Buffer.from(bytes);
					await bin_fd.write(buf);
				}

				var s = bytes.map(n => n.toString(16).padStart(2, '0')).join(' ');
				console.log(location_counter.toString(16).padStart(4, '0'), s.padEnd(12, ' '), line);
				location_counter += bytes.length;
			}
		});

		await events.once(rl, 'close');
	}
	catch (err) {
		console.error(err);
	}
}

run();
