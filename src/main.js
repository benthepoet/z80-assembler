var STATE = {
	mnemonic: null,
	opcode: null,
	operand: null,
	operand_length: null,
	displacement: null,
	opcode_shifts: [],
	tokens: []
};

var MNEMONICS_0 = {
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

var MNEMONICS_1 = {
	adc: add_adc_sub_sbc,
	add: add_adc_sub_sbc,
	and: and_cp_or_xor,
	bit: bit_set_res,
	cp: and_cp_or_xor,
	dec: inc_dec,
	djnz: djnz_jp_jr,
	ex: ex,
	inc: inc_dec,
	jp: djnz_jp_jr,
	jr: djnz_jp_jr,
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

var PATTERNS = {
	add_adc_sub_sbc_group_1: [
		[0x00, 0x80, ["a", "r'"]],
		[0x00, 0xC0, ["a", "n"]],
		[0x00, 0x86, ["a", "(", "hl", ")"]],
		[0xDD, 0x86, ["a", "(", "ix", "+", "dp", ")"]],
		[0xFD, 0x86, ["a", "(", "iy", "+", "dp", ")"]]
	],
	add_adc_sub_sbc_group_2: [
		[0xED, 0x42, ["hl", "ss"]]
	],
	add_adc_sub_sbc_group_3: [
		[0x00, 0x09, ["hl", "ss"]],
		[0xDD, 0x09, ["ix", "pp"]],
		[0xFD, 0x09, ["iy", "rr"]]
	],
	and_cp_or_xor_group_1: [
		[0x00, 0xA0, ["a", "r'"]]
		[0x00, 0xE6, ["a", "n"]]
		[0x00, 0xA6, ["a", "(", "hl", ")"]],
		[0xDD, 0xA6, ["a", "(", "ix", "+", "dp", ")"]],
		[0xFD, 0x86, ["a", "(", "iy", "+", "dp", ")"]]
	],
	bit_set_res_group_1: [
		[0xCB, 0x00, ["bt", "r'"]],
		[0xCB, 0x06, ["bt", "(", "hl", ")"]],
		[0xDDCB, 0x06, ["bt", "(", "ix", "+", "dp", ")"]],
		[0xFDCB, 0x06, ["bt", "(", "iy", "+", "dp", ")"]]
	],
	djnz_jp_jr_group_1: [
		[0x00, 0x10, ["n"]]
	],
	djnz_jp_jr_group_2: [
		{
			pattern: ["nn"],
			prefix: 0x00,
			base: 0xC3
		},
		{
			pattern: ["cc", "nn"],
			prefix: 0x00,
			base: 0xC2
		},
		{
			pattern: ["(", "hl", ")"],
			prefix: 0x00,
			base: 0xE9
		},
		{
			pattern: ["(", "ix", ")"],
			prefix: 0xDD,
			base: 0xE9
		},
		{
			pattern: ["(", "iy", ")"],
			prefix: 0xFD,
			base: 0xE9
		}
	],
	djnz_jp_jr_group_3: [
		{
			pattern: ["n"],
			prefix: 0x00,
			base: 0x18
		},
		{
			pattern: ["vv", "n"],
			prefix: 0x00,
			base: 0x20
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
		[0x00, 0x03, ["ss"]],
		[0xDD, 0x23, ["ix"]],
		[0xFD, 0x23, ["iy"]]
	],
	push_pop_group_1: [
		[0x00, 0xC1, ["qq"]],
		[0xDD, 0xE1, ["ix"]],
		[0xFD, 0xE1, ["iy"]]
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

var MATCH_TABLES = {
	cc: ["nz", "z", "nc", "c", "po", "pe", "p", "m"],
	pp: ["bc", "de", "ix", "sp"],
	qq: ["bc", "de", "hl", "af"],
	r: ["b", "c", "d", "e", "h", "l", "a"],
	rr: ["bc", "de", "iy", "sp"],
	ss: ["bc", "de", "hl", "sp"],
	vv: ["nz", "z", "nc", "c"]
};

function match_group_0(token, sym) {
	return token === sym;
}

function match_group_1(token, sym) {
	var i;
	if (sym === "r" || sym === "r'") {
		i = MATCH_TABLES.r.indexOf(token);
		if (i === -1) return false;
		else if (i === 6) i++;

		if (sym === "r") STATE.opcode_shifts.push(i << 3);
		else if (sym === "r'") STATE.opcode_shifts.push(i);

		return true;
	}
	else if (sym === "dp") {
		if (token < 0x00 || token > 0xFF) return false;
		return true;
	}
	else if (sym === "n") {
		if (STATE.operand < 0x00 || STATE.operand > 0xFF) return false;
		STATE.operand_length = 1;
		return true;
	}
	else if (sym === "nn") {
                if (STATE.operand < 0x00 || STATE.operand > 0xFFFF) return false;
		STATE.operand_length = 2;
                return true;
        }
	else if (sym === "bt") {
		if (token < 0 || token > 7) return false;
		STATE.opcode_shifts.push(token << 3);
		return true;
	}

	return token === sym;
}

function match_group_2(token, sym) {
	var i;
	if (sym === "pp") {
		i = MATCH_TABLES.pp.indexOf(token);
		if (i === -1) return false;
		STATE.opcode_shifts.push(i << 4);
		return true;
	}
	else if (sym === "qq") {
		i = MATCH_TABLES.qq.indexOf(token);
		if (i === -1) return false;
		STATE.opcode_shifts.push(i << 4);
		return true;
	}
	else if (sym === "rr") {
		i = MATCH_TABLES.rr.indexOf(token);
		if (i === -1) return false;
		STATE.opcode_shifts.push(i << 4);
		return true;
	}
	else if (sym === "ss") {
		i = MATCH_TABLES.ss.indexOf(token);
		if (i === -1) return false;
		STATE.opcode_shifts.push(i << 4);
		return true;
	}
       else if (sym === "nn") {
                if (token < 0x00 || token > 0xFFFF) return false;
                return true;
        }

	return token === sym;
}

function match_group_3(token, sym) {
	var i;
	if (sym === "cc") {
		i = MATCH_TABLES.cc.indexOf(token);
		if (i === -1) return false;
		STATE.opcode_shifts.push(i << 3);
		return true;
	}
	else if (sym === "vv") {
		i = MATCH_TABLES.vv.indexOf(token);
		if (i === -1) return false;
		STATE.opcode_shifts.push(i << 3);
		return true;
	}
	else if (sym === "nn") {
		if (token < 0x00 || token > 0xFFFF) return false;
		return true;
	}
        else if (sym === "n") {
                if (token < 0x00 || token > 0xFF) return false;
                return true;
        }

	return token === sym;
}

function find_pattern(tokens, patterns, match_fn) {
	for (const p of patterns)
	{
		if (tokens.length !== p.pattern.length) continue;
		STATE.operand_length = null;
		STATE.opcode_shifts = [];

		var matched = false;
		for (var i = 0; i < tokens.length; i++) {
			matched = match_fn(tokens[i], p.pattern[i]);
			if (!matched) break;
		}

		if (matched) return p;
	}

	return null;
}

function add_adc_sub_sbc(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.add_adc_sub_sbc_group_1, match_group_1)) !== null) {
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
	var opcode = null;
	var pattern = null;
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
	var opcode = null;
	var pattern = null;
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

function djnz_jp_jr(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
	if (mnemonic === "djnz" && (pattern = find_pattern(tokens, PATTERNS.djnz_jp_jr_group_1, match_group_3)) !== null) {
		opcode = pattern.base;
	}
	else if (mnemonic === "jp" && (pattern = find_pattern(tokens, PATTERNS.djnz_jp_jr_group_2, match_group_3)) !== null) {
		opcode = pattern.base;
	}
	else if (mnemonic === "jr" && (pattern = find_pattern(tokens, PATTERNS.djnz_jp_jr_group_3, match_group_3)) !== null) {
		opcode = pattern.base;
	}

	if (opcode !== null) {
		opcode = apply_opcode_shifts(opcode);
		return [to_hex(pattern.prefix), to_hex(opcode)];
	}

	throw Error("Failed to match any pattern.");
}

function ex(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.ex_group_1, match_group_0)) !== null) {
		opcode = pattern.base;
		return [to_hex(pattern.prefix), to_hex(opcode)];
	}

	throw Error("Failed to match any pattern.");
}

function inc_dec(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
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
	var opcode = null;
	var pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.push_pop_group_1, match_group_2)) !== null) {
		opcode = pattern.base;
		if (mnemonic === "pop") opcode |= 4;

		opcode = apply_opcode_shifts(opcode);
		return [to_hex(pattern.prefix), to_hex(opcode)];
	}

	throw Error("Failed to match any pattern.");
}

function rlc_rl_rrc_rr_sla_sra_srl(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
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

function apply_opcode_shifts(opcode) {
	for (var i = 0; i < STATE.opcode_shifts.length; i++) {
		opcode |= STATE.opcode_shifts[i];
	}

	return opcode;
}

function lookup_opcode(mnemonic, tokens) {
	if (tokens.length === 0) {
        	var mnem0 = MNEMONICS_0[mnemonic];
        	if (mnem0) return [to_hex(mnem0.prefix), to_hex(mnem0.opcode)];
	}

	var mnem1 = MNEMONICS_1[mnemonic];
	if (mnem1) return mnem1(mnemonic, tokens);

	throw Error("Failed to match any mnemonic.");
}

function to_hex(value) {
	return value.toString(16);
}

function parse(str) {
	STATE.mnemonic = null;
	STATE.operand = null;
	STATE.tokens = [];

	var current = ''

	for (var i = 0; i < str.length; i++) {
		var sep = str[i] === ' ' || str[i] === ',' || str[i] === '\n' || str[i] === '(' || str[i] === ')' || str[i] === '+';
		if (sep) {
			if (current !== '') {
				push_token(current);
				current = '';
			}
			if (str[i] === '(' || str[i] === ')' || str[i] === '+') {
				push_token(str[i]);
			}
		}
		else {
			current += str[i];
		} 		
	}

	if (current !== '') {
		push_token(current);
	}

	STATE.mnemonic = STATE.tokens.shift();

	return STATE;
}

function assemble(str) {
	parse(str);
	return lookup_opcode(STATE.mnemonic, STATE.tokens);
}

function get_state() {
	return STATE;
}

function push_token(token) {
	if (token[0] === '$') {
		var value = parseInt(token.substring(1), 16);
		STATE.operand = value;
		STATE.tokens.push('nn');
	}
	else {
		STATE.tokens.push(token);
	} 
}

exports.assemble = assemble;
exports.get_state = get_state;
exports.parse = parse;
