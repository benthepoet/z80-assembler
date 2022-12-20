const MNEMONICS_0 = {
	daa: { prefix: 0x00, opcode: 0x27 },
	cpl: { prefix: 0x00, opcode: 0x2F },
	neg: { prefix: 0xED, opcode: 0x44 },
	ccf: { prefix: 0x00, opcode: 0x3F },
	scf: { prefix: 0x00, opcode: 0x37 },
	nop: { prefix: 0x00, opcode: 0x00 },
	halt: { prefix: 0x00, opcode: 0x76 },
	di: { prefix: 0x00, opcode: 0xF3 },
	ei: { prefix: 0x00, opcode: 0xFB },
	exx: { prefix: 0x00, opcode: 0xD9 },
	ldi: { prefix: 0xED, opcode: 0xA0 },
	ldir: { prefix: 0xED, opcode: 0xB0 },
	ldd: { prefix: 0xED, opcode: 0xA8 },
	lddr: { prefix: 0xED, opcode: 0xB8 },
	cpi: { prefix: 0xED, opcode: 0xA1 },
	cpir: { prefix: 0xED, opcode: 0xB1 },
	cpd: { prefix: 0xED, opcode: 0xA9 },
	cpdr: { prefix: 0xED, opcode: 0xB9 },
	rlca: { prefix: 0x00, opcode: 0x07 },
	rla: { prefix: 0x00, opcode: 0x17 },
	rrca: { prefix: 0x00, opcode: 0x0F },
	rra: { prefix: 0x00, opcode: 0x1F },
	rld: { prefix: 0xED, opcode: 0x6F },
	rrd: { prefix: 0xED, opcode: 0x67 },
	reti: { prefix: 0xED, opcode: 0x4D },
	retn: { prefix: 0xED, opcode: 0x45 },
	ret: { prefix: 0x00, opcode: 0xC9 },
	ini: { prefix: 0xED, opcode: 0xA2 },
	inir: { prefix: 0xED, opcode: 0xB2 },
	ind: { prefix: 0xED, opcode: 0xAA },
	indr: { prefix: 0xED, opcode: 0xBA },
	outi: { prefix: 0xED, opcode: 0xA3 },
	otir: { prefix: 0xED, opcode: 0xB3 },
	outd: { prefix: 0xED, opcode: 0xAB },
	otdr: { prefix: 0xED, opcode: 0xBB } 
};

const MNEMONICS_1 = {
	adc: add_adc_sub_sbc,
	add: add_adc_sub_sbc,
	and: and_cp_or_xor,
	bit: bit_set_res,
	cp: and_cp_or_xor,
	dec: inc_dec,
	ex: ex,
	inc: inc_dec,
	or: and_cp_or_xor,
	push: push_pop,
	pop: push_pop,
	res: bit_set_res,
	rl: rlc_rl_rrc_rr_sla_sra_srl,
	rlc: rlc_rl_rrc_rr_sla_sra_srl,
	rr: rlc_rl_rrc_rr_sla_sra_srl,
	rrc: rlc_rl_rrc_rr_sla_sra_srl,
	sbc: add_adc_sub_sbc,
	set: bit_set_res,
	sla: rlc_rl_rrc_rr_sla_sra_srl,
	sra: rlc_rl_rrc_rr_sla_sra_srl,
	srl: rlc_rl_rrc_rr_sla_sra_srl,
	sub: add_adc_sub_sbc,
	xor: and_cp_or_xor
};

const PATTERNS = {
	add_adc_sub_sbc_group_1: [
		{
			pattern: ["a", "r'"],
			prefix: 0x00,
			base: 0x80
		},
		{
			pattern: ["a", "n"],
			prefix: 0x00,
			base: 0xC0
		},
		{
			pattern: ["a", "(", "hl", ")"],
			prefix: 0x00,
			base: 0x86
		},
		{
			pattern: ["a", "(", "ix", "dp", ")"],
			prefix: 0xDD,
			base: 0x86
		},
		{
			pattern: ["a", "(", "iy", "dp", ")"],
			prefix: 0xFD,
			base: 0x86
		}
	],
	add_adc_sub_sbc_group_2: [
		{
			pattern: ["hl", "ss"],
			prefix: 0xED,
			base: 0x42
		}
	],
	add_adc_sub_sbc_group_3: [
		{
			pattern: ["hl", "ss"],
			prefix: 0x00,
			base: 0x09
		},
		{
			pattern: ["ix", "pp"],
			prefix: 0xDD,
			base: 0x09
		},
		{
			pattern: ["iy", "rr"],
			prefix: 0xFD,
			base: 0x09
		}
	],
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
		},
		{
			pattern: ["bt", "(", "hl", ")"],
			prefix: 0xCB,
			base: 0x06
		},
		{
			pattern: ["bt", "(", "ix", "dp", ")"],
			prefix: 0xDDCB,
			base: 0x06
		},
		{
			pattern: ["bt", "(", "iy", "dp", ")"],
			prefix: 0xFDCB,
			base: 0x06
		}
	],
	ex_group_1: [
		{
			pattern: ["de", "hl"],
			prefix: 0x00,
			base: 0xEB
		},
		{
			pattern: ["af", "af'"],
			prefix: 0x00,
			base: 0x08
		},
		{
			pattern: ["(", "sp", ")", "hl"],
			prefix: 0x00,
			base: 0xE3
		},
		{
			pattern: ["(", "sp", ")", "ix"],
			prefix: 0xDD,
			base: 0xE3
		},
		{
			pattern: ["(", "sp", ")", "iy"],
			prefix: 0xFD,
			base: 0xE3
		}
	],
	im_group_1: [
		{
			pattern: ["1"],
			prefix: 0xED,
			base: 0x46
		},
		{
			pattern: ["2"],
			prefix: 0xED,
			base: 0x56
		},
		{
			pattern: ["3"],
			prefix: 0xED,
			base: 0x5E
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
	],
	rlc_rl_rrc_rr_sla_sra_srl_group_1: [
		{
			pattern: ["r'"],
			prefix: 0xCB,
			base: 0x00
		},
		{
			pattern: ["(", "hl", ")"],
			prefix: 0xCB,
			base: 0x06
		},
		{
			pattern: ["(", "ix", "dp", ")"],
			prefix: 0xDDCB,
			base: 0x06
		},
		{
			pattern: ["(", "iy", "dp", ")"],
			prefix: 0xFDCB,
			base: 0x06
		}
	]
};

const MATCH_TABLES = {
	pp: ["bc", "de", "ix", "sp"],
	qq: ["bc", "de", "hl", "af"],
	r: ["b", "c", "d", "e", "h", "l", "a"],
	rr: ["bc", "de", "iy", "sp"],
	ss: ["bc", "de", "hl", "sp"]
};

let opcode_shifts = [];

function match_group_0(token, sym) {
	return token === sym;
}

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
	if (sym === "pp") {
		let i = MATCH_TABLES.pp.indexOf(token);
		if (i === -1) return false;
		opcode_shifts.push(i << 4);
		return true;
	}
	else if (sym === "qq") {
		let i = MATCH_TABLES.qq.indexOf(token);
		if (i === -1) return false;
		opcode_shifts.push(i << 4);
		return true;
	}
	else if (sym === "rr") {
		let i = MATCH_TABLES.rr.indexOf(token);
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

function add_adc_sub_sbc(mnemonic, tokens) {
	let opcode = null;
	let pattern = null;
	if (tokens[0] === "a" && (pattern = find_pattern(tokens, PATTERNS.add_adc_sub_sbc_group_1, match_group_1)) !== null) {
		opcode = pattern.base;
		if (mnemonic === "adc") opcode |= 8;
		else if (mnemonic === "sub") opcode |= 16;
		else if (mnemonic === "sbc") opcode |= 24;
	}
	else if (mnemonic === "add" && (pattern = find_pattern(tokens, PATTERNS.add_adc_sub_sbc_group_3, match_group_2)) !== null) {
		opcode = pattern.base;
	}
	else if (mnemonic !== "sub" && (pattern = find_pattern(tokens, PATTERNS.add_adc_sub_sbc_group_2, match_group_2)) !== null) {
		opcode = pattern.base;
	}

	if (opcode != null) {
		opcode = apply_opcode_shifts(opcode);
		return [to_hex(pattern.prefix), to_hex(opcode)];
	}

	throw Error("Failed to match any pattern.");
}

function and_cp_or_xor(mnemonic, tokens) {
	let opcode = null;
	let pattern = null;
	if (tokens[0] === "a" && (pattern = find_pattern(tokens, PATTERNS.and_cp_or_xor_group_1, match_group_1)) !== null) {
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

function ex(mnemonic, tokens) {
	let opcode = null;
	let pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.ex_group_1, match_group_0)) !== null) {
		opcode = pattern.base;
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

function rlc_rl_rrc_rr_sla_sra_srl(mnemonic, tokens) {
	let opcode = null;
	let pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.rlc_rl_rrc_rr_sla_sra_srl_group_1, match_group_1)) !== null) {
		opcode = pattern.base;
		if (mnemonic === "rrc") opcode |= 8;
		else if (mnemonic === "rl") opcode |= 16;
		else if (mnemonic === "rr") opcode |= 24;
		else if (mnemonic === "sla") opcode |= 32;
		else if (mnemonic === "sra") opcode |= 48;
		else if (mnemonic === "srl") opcode |= 56;

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
	if (tokens.length === 0) {
		for (const [key, value] of Object.entries(MNEMONICS_0)) {
			if (mnemonic === key) {
				return [to_hex(value.prefix), to_hex(value.opcode)];
			}
		}
	}

	for (const [key, fn] of Object.entries(MNEMONICS_1)) {
		if (mnemonic === key) {
			return fn(mnemonic, tokens);
		}
	}

	throw Error("Failed to match any mnemonic.");
}

function to_hex(value) {
	return value.toString(16);
}

exports.assemble = assemble;
