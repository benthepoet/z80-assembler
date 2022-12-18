const MNEMONICS = {
	and: and_cp_or_xor,
	bit: bit_set_res,
	cp: and_cp_or_xor,
	dec: inc_dec,
	inc: inc_dec,
	or: and_cp_or_xor,
	push: push_pop,
	pop: push_pop,
	res: bit_set_res,
	set: bit_set_res,
	xor: and_cp_or_xor
};

const PATTERNS = {
	and_cp_or_xor_group_1: [
		{
			pattern: ["a", "r'"],
			prefix: 0x00,
			base: 0xA0
		},
		{
			pattern: ["a", "n"],
			prefix: 0x00,
			base: 0xE6
		},
		{
			pattern: ["a", "(", "hl", ")"],
			prefix: 0x00,
			base: 0xA6
		},
		{
			pattern: ["a", "(", "ix", "dp", ")"],
			prefix: 0xDD,
			base: 0xA6
		},
		{
			pattern: ["a", "(", "iy", "dp", ")"],
			prefix: 0xFD,
			base: 0x86
		}
	],
	bit_set_res_group_1: [
		{
			pattern: ["bt", "r'"],
			prefix: 0xCB,
			base: 0x00
		}
	],
	inc_dec_group_1: [
		{
			pattern: ["r"],
			prefix: 0x00,
			base: 0x04
		},
		{
			pattern: ["(", "hl", ")"],
			prefix: 0x00,
			base: 0x34
		},
		{
			pattern: ["(", "ix", "dp", ")"],
			prefix: 0xDD,
			base: 0x34
		},
		{
			pattern: ["(", "iy", "dp", ")"],
			prefix: 0xFD,
			base: 0x34
		}
	],
	inc_dec_group_2: [
		{
			pattern: ["ss"],
			prefix: 0x00,
			base: 0x03
		},
		{
			pattern: ["ix"],
			prefix: 0xDD,
			base: 0x23
		},
		{
			pattern: ["iy"],
			prefix: 0xFD,
			base: 0x23
		}
	],
	push_pop_group_1: [
		{
			pattern: ["qq"],
			prefix: 0x00,
			base: 0xC1
		},
		{
			pattern: ["ix"],
			prefix: 0xDD,
			base: 0xE1
		},
		{
			pattern: ["iy"],
			prefix: 0xFD,
			base: 0xE1
		}
	]
};

const MATCH_TABLES = {
	qq: ["bc","de","hl","af"],
	r: ["b","c","d","e","h","l","a"],
	ss: ["bc","de","hl","sp"]
};

let opcode_shifts = [];

function match_group_1(token, sym) {
	if (sym === "r" || sym === "r'") {
		let i = MATCH_TABLES.r.indexOf(token);
		if (i === -1) return false;
		else if (i === 6) i++;

		if (sym === "r") opcode_shifts.push(i << 3);
		else if (sym === "r'") opcode_shifts.push(i);

		return true;
	}
	else if (sym === "dp") {
		if (token < 0x00 || token > 0xFF) return false;
		return true;
	}
	else if (sym === "n") {
		if (token < 0x00 || token > 0xFF) return false;
		return true;
	}
	else if (sym === "bt") {
		if (token < 0 || token > 7) return false;
		opcode_shifts.push(token << 3);
		return true;
	}

	return token === sym;
}

function match_group_2(token, sym) {
	if (sym === "qq") {
		let i = MATCH_TABLES.qq.indexOf(token);
		if (i === -1) return false;
		opcode_shifts.push(i << 4);
		return true;
	}
	else if (sym === "ss") {
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
		if (mnemonic === "xor") opcode |= 8;
		else if (mnemonic === "or") opcode |= 16;
		else opcode |= 24;

		opcode = apply_opcode_shifts(opcode);
		return [to_hex(pattern.prefix), to_hex(opcode)];
	}

	throw Error("Failed to match any pattern.");
}

function bit_set_res(mnemonic, tokens) {
	let opcode = null;
	let pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.bit_set_res_group_1, match_group_1)) !== null) {
		opcode = pattern.base;
		if (mnemonic === "bit") opcode |= 64;
		else if (mnemonic == "res") opcode |= 128;
		else opcode |= 192;

		opcode = apply_opcode_shifts(opcode);
		return [to_hex(pattern.prefix), to_hex(opcode)]; 
	}

	throw Error("Failed to match any pattern.");
}

function inc_dec(mnemonic, tokens) {
	let opcode = null;
	let pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.inc_dec_group_1, match_group_1)) !== null) {
		opcode = pattern.base;
		if (mnemonic === "dec") opcode |= 1;
	}
	else if ((pattern = find_pattern(tokens, PATTERNS.inc_dec_group_2, match_group_2)) !== null) {
		opcode = pattern.base;
		if (mnemonic === "dec") opcode |= 8;
	}

	if (opcode !== null) {
		opcode = apply_opcode_shifts(opcode);
		return [to_hex(pattern.prefix), to_hex(opcode)];
	}

	throw Error("Failed to match any pattern.");
}

function push_pop(mnemonic, tokens) {
	let opcode = null;
	let pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.push_pop_group_1, match_group_2)) !== null) {
		opcode = pattern.base;
		if (mnemonic === "pop") opcode |= 4;

		opcode = apply_opcode_shifts(opcode);
		return [to_hex(pattern.prefix), to_hex(opcode)];
	}

	throw Error("Failed to match any pattern.");
}

function find_mnemonic(mnemonic) {
	for (const k of Object.keys(MNEMONICS)) {
		if (mnemonic === k) return MNEMONICS[k];
	}

	return null;
}

function apply_opcode_shifts(opcode) {
	for (const s of opcode_shifts) {
		opcode |= s;
	}

	return opcode;
}

function assemble(mnemonic, tokens) {
	const mnemonic_fn = find_mnemonic(mnemonic);
	if (mnemonic_fn != null) return mnemonic_fn(mnemonic, tokens);
	throw Error("Failed to match any mnemonic.");
}

function to_hex(value) {
	return value.toString(16);
}

console.log(assemble("inc", ["(", "iy", 0x00, ")"]));
console.log(assemble("and", ["a", "c"]));
console.log(assemble("res", [2, "h"]));
