import { open } from 'node:fs/promises'
import { parseArgs } from 'node:util'

import { assemble } from './main.js'

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

var location_counter = 0;

try {
	var src_file = await open(values.src_filename, 'r');
		
	var bin_file = null;
	if (values.bin_filename != null) {
		bin_file = await open(values.bin_filename, 'w' );
	} 		

	for await (var line of src_file.readLines()) {
		var bytes = assemble(line);
		if (bytes.length > 0) {
			if (bin_file !== null) {
				var buf = Buffer.from(bytes);
				await bin_file.write(buf);
			}

			var byteString = bytes.map(n => n.toString(16).padStart(2, '0')).join(' ');
			console.log(location_counter.toString(16).padStart(4, '0'), byteString.padEnd(12, ' '), line);
			location_counter += bytes.length;
		}
	}

}
catch (err) {
	console.error(err);
}
