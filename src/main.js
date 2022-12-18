const MNEMONICS = {
	and: and_cp_or_xor,
	cp: and_cp_or_xor,
	dec: inc_dec,
	inc: inc_dec,
	or: and_cp_or_xor,
	xor: and_cp_or_xor
};

const PATTERNS = {
	and_cp_or_xor_group_1: [
		{
			pattern: ['a', 'r2'],
			prefix: 0x00,
			base: 0xA0
		},
		{
			pattern: ['a', 'n'],
			prefix: 0x00,
			base: 0xE6
		}
	],
	inc_dec_group_1: [
		{
			pattern: ['r1'],
			prefix: 0x00,
			base: 0x04
		},
		{
			pattern: ['(', 'hl', ')'],
			prefix: 0x00,
			base: 0x34
		},
		{
			pattern: ['(', 'ix', 'dp', ')'],
			prefix: 0xDD,
			base: 0x34
		},
		{
			pattern: ['(', 'iy', 'dp', ')'],
			prefix: 0xFD,
			base: 0x34
		}
	],
	inc_dec_group_2: [
		{
			pattern: ['ss'],
			prefix: 0x00,
			base: 0x03
		},
		{
			pattern: ['ix'],
			prefix: 0xDD,
			base: 0x23
		},
		{
			pattern: ['iy'],
			prefix: 0xFD,
			base: 0x23
		}
	]
};

const MATCH_TABLES = {
	r1: ['b','c','d','e','h','l','a'],
	r2: ['b','c','d','e','h','l','a'],
	ss: ['bc','de','hl','sp']
};

let opcode_shifts = [];

function match_group_1(token, sym) {
	if (sym === 'r1') {
		let i = MATCH_TABLES.r1.indexOf(token);
		if (i === -1) return false;
		else if (i === 6) i++;
		opcode_shifts.push(i << 3);
		return true;
	}
	else if (sym === 'r2') {
		let i = MATCH_TABLES.r2.indexOf(token);
		if (i === -1) return false;
		else if (i === 6) i++;
		opcode_shifts.push(i);
		return true;
	}
	else if (sym === 'dp') {
		if (token < 0x00 || token > 0xFF) return false;
		return true;
	}
	else if (sym === 'n') {
		if (token < 0x00 || token > 0xFF) return false;
		return true;
	}

	return token === sym;
}

function match_group_2(token, sym) {
	if (sym === 'ss') {
		let i = MATCH_TABLES.ss.indexOf(token);
		if (i === -1) return false;
		opcode_shifts.push(i << 4);
		return true;
	}

	return token === sym;
}

function find_pattern(tokens, patterns, match_fn) {
	for (const p of patterns)
	{
		if (tokens.length !== p.pattern.length) continue;
		opcode_shifts = [];

		let matched = false;
		for (let i = 0; i < tokens.length; i++) {
			matched = match_fn(tokens[i], p.pattern[i]);
			if (!matched) break;
		}

		if (matched) return p;
	}

	return null;
}

function and_cp_or_xor(mnemonic, tokens) {
	let opcode = null;
	let pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.and_cp_or_xor_group_1, match_group_1)) !== null) {
		opcode = pattern.base;
		if (mnemonic == 'xor') opcode |= 8;
		else if (mnemonic == 'or') opcode |= 16;
		else if (mnemonic == 'cp') opcode |= 24;

		for (const s of opcode_shifts) {
			opcode |= s;
		}

		return [toHex(pattern.prefix), toHex(opcode)];
	}

	throw Error('Failed to match any pattern');
}

function inc_dec(mnemonic, tokens) {
	let opcode = null;
	let pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.inc_dec_group_1, match_group_1)) !== null) {
		opcode = pattern.base;
		if (mnemonic === 'dec') opcode |= 1;
	}
	else if ((pattern = find_pattern(tokens, PATTERNS.inc_dec_group_2, match_group_2)) !== null) {
		opcode = pattern.base;
		if (mnemonic === 'dec') opcode |= 8;
	}

	if (opcode !== null) {
		for (const s of opcode_shifts) {
			opcode |= s;
		}

		return [toHex(pattern.prefix), toHex(opcode)];
	}

	throw Error('Failed to match any pattern.');
}

function toHex(value) {
	return value.toString(16);
}

console.log(inc_dec('inc', ['(', 'iy', 0x00, ')']));
console.log(and_cp_or_xor('and', ['a', 0xFF]));
