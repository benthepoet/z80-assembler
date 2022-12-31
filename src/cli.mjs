import { open } from 'node:fs/promises'
import { parseArgs } from 'node:util'

import { assemble, enable_output, get_state, inc_location, init_location } from './main.js'

var { values } = parseArgs({
	options: {
		src_filename: {
			type: 'string',
			short: 's'
		},
		bin_filename: {
			type: 'string',
			short: 'b'
		},
		verbose: {
			type: 'boolean',
			short: 'v'
		}
	}
});

if (!values.src_filename) {
	throw Error("Source file not specified.");
}

try {
	console.log("Pass 1");
	print_brk();
	await process(false);

	console.log("Pass 2");
	enable_output();
	print_brk();
	await process(true);
}
catch (err) {
	console.error(err);
}

function print_brk() {
	console.log("".padStart(32, '='));
}

async function process(output) {
	try {
		var src_file = await open(values.src_filename, 'r');
			
		var bin_file = null;
		if (values.bin_filename != null) {
			bin_file = await open(values.bin_filename, 'w' );
		}

		var location_counter = init_location();
		for await (var line of src_file.readLines()) {
			var bytes = assemble(line);

			if (output && values.verbose) {
				var byteString = bytes.map(n => n.toString(16).padStart(2, '0')).join(' ');
				console.log(location_counter.toString(16).padStart(4, '0'), byteString.padEnd(12, ' '), line);
			}

			if (bytes.length > 0) {
				if (output && bin_file !== null) {
					await bin_file.write(Buffer.from(bytes));
				}

				location_counter = inc_location(bytes.length);
			}
		}

		if (values.verbose) {
			console.log(get_state(), '\n');
		}
	}
	finally {
		await src_file?.close();
		await bin_file?.close();
	}
}
