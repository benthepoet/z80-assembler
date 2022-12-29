
var	current_word = null;
var	line_cursor = 0;
var	line_buffer = null;

function read_word() {
	current_word = '';

	while (line_buffer[line_cursor] === ' ' && line_cursor < line_buffer.length) {
		line_cursor++;
	}

	while (line_buffer[line_cursor] !== ' ' && line_cursor < line_buffer.length) {
		current_word += line_buffer[line_cursor];
		line_cursor++;
	}
}

function load_line_buffer(line) {
	line_buffer = '';

	for (var i = 0; i < line.length; i++) {
		var c = line[i];
		if (c === ',') c = ' ';
		else if (c === '(') c = '( '
		else if (c === ')') c = ' )'
		else if (c === '+') c = ' + '
		line_buffer += c;
	}
}

load_line_buffer("ld a,(ix+$45)");
console.log(line_buffer);

read_word();
while (current_word !== '') {
	console.log(current_word);
	read_word();
}

/*
- Ends with '=' then constant
	- Read hex value
- Ends with ':' then label
	- Store symbol with location value
- Otherwise try mnemonic/directive
*/
