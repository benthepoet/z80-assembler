import { open } from 'node:fs/promises'
import { parseArgs } from 'node:util'

import { assemble, inc_location, init_location } from './main.js'

var { values } = parseArgs({
	options: {
		src_filename: {
			type: 'string',
			short: 's'
		},
		bin_filename: {
			type: 'string',
			short: 'b'
		}
	}
});

if (!values.src_filename) {
	throw Error("Source file not specified.");
}

try {
	var src_file = await open(values.src_filename, 'r');
		
	var bin_file = null;
	if (values.bin_filename != null) {
		bin_file = await open(values.bin_filename, 'w' );
	}		

	var location_counter = init_location();
	for await (var line of src_file.readLines()) {
		var bytes = assemble(line);
		if (bytes.length > 0) {
			if (bin_file !== null) {
				await bin_file.write(Buffer.from(bytes));
			}

			var byteString = bytes.map(n => n.toString(16).padStart(2, '0')).join(' ');
			console.log(location_counter.toString(16).padStart(4, '0'), byteString.padEnd(12, ' '), line);
			location_counter = inc_location(bytes.length);
		}
	}

}
catch (err) {
	console.error(err);
}
