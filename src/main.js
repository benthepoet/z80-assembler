var STATE = {
	mnemonic: null,
	opcode: null,
	operand: null,
	operand_length: null,
	displacement: null,
	opcode_shifts: [],
	tokens: [],
	current_word: null,
	line_buffer: null,
	line_cursor: null
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
	im: im,
	inc: inc_dec,
	jp: djnz_jp_jr,
	jr: djnz_jp_jr,
	ld: ld,
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
		[0x00, 0x80, ["a", "r2"]],
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
		[0xFD, 0x09, ["iy", "qq"]]
	],
	and_cp_or_xor_group_1: [
		[0x00, 0xA0, ["a", "r2"]],
		[0x00, 0xE6, ["a", "n"]],
		[0x00, 0xA6, ["a", "(", "hl", ")"]],
		[0xDD, 0xA6, ["a", "(", "ix", "+", "dp", ")"]],
		[0xFD, 0xA6, ["a", "(", "iy", "+", "dp", ")"]]
	],
	bit_set_res_group_1: [
		[0xCB, 0x00, ["bt", "r2"]],
		[0xCB, 0x06, ["bt", "(", "hl", ")"]],
		[0xDDCB, 0x06, ["bt", "(", "ix", "+", "dp", ")"]],
		[0xFDCB, 0x06, ["bt", "(", "iy", "+", "dp", ")"]]
	],
	djnz_jp_jr_group_1: [
		[0x00, 0x10, ["n"]]
	],
	djnz_jp_jr_group_2: [
		[0x00, 0xC3, ["nn"]],
		[0x00, 0xC2, ["cc", "nn"]],
		[0x00, 0xE9, ["(", "hl", ")"]]
		[0xDD, 0xE9, ["(", "ix", ")"]],
		[0xFD, 0xE9, ["(", "iy", ")"]]
	],
	djnz_jp_jr_group_3: [
		[0x00, 0x18, ["n"]],
		[0x00, 0x20, ["vv", "n"]]
	],
	ex_group_1: [
		[0x00, 0xEB, ["de", "hl"]],
		[0x00, 0x08, ["af", "af'"]],
		[0x00, 0xE3, ["(", "sp", ")", "hl"]],
		[0xDD, 0xE3, ["(", "sp", ")", "ix"]],
		[0xFD, 0xE3, ["(", "sp", ")", "iy"]]
	],
	im_group_1: [
		[0xED, 0x46, ["1"]],
		[0xED, 0x56, ["2"]],
		[0xED, 0x5E, ["3"]]
	],
	inc_dec_group_1: [
		[0x00, 0x04, ["r1"]],
		[0x00, 0x34, ["(", "hl", ")"]],
		[0xDD, 0x34, ["(", "ix", "+", "dp", ")"]],
		[0xFD, 0x34, ["(", "iy", "+", "dp", ")"]]
	],
	inc_dec_group_2: [
		[0x00, 0x03, ["ss"]],
		[0xDD, 0x23, ["ix"]],
		[0xFD, 0x23, ["iy"]]
	],
	ld_group_1: [
		[0x00, 0x40, ["r1", "r2"]],
		[0x00, 0x06, ["r1", "n"]],
		[0x00, 0x46, ["r1", "hl"]],
		[0xDD, 0x46, ["r1", "(", "ix", "+", "dp", ")"]],
		[0xFD, 0x46, ["r1", "(", "iy", "+", "dp", ")"]]
	],
	ld_group_2: [
		[0x00, 0x70, ["(", "hl", ")", "r2"]],
		[0xDD, 0x70, ["(", "ix", "+", "dp", ")", "r2"]],
		[0xFD, 0x70, ["(", "iy", "+", "dp", ")", "r2"]],
		[0x00, 0x36, ["(", "hl", ")", "n"]],
		[0xDD, 0x36, ["(", "ix", "+", "dp", ")", "n"]],
		[0xFD, 0x36, ["(", "iy", "+", "dp", ")", "n"]],
		[0x00, 0x02, ["(", "bc", ")", "a"]],
		[0x00, 0x12, ["(", "de", ")", "a"]],
		[0x00, 0x32, ["(", "nn", ")", "a"]],
		[0x00, 0x22, ["(", "nn", ")", "hl"]],
		[0xED, 0x43, ["(", "nn", ")", "ss"]],
		[0xDD, 0x22, ["(", "nn", ")", "ix"]],
		[0xFD, 0x22, ["(", "nn", ")", "iy"]]
	],
	ld_group_3: [
		[0x00, 0x0A, ["a", "(", "bc", ")"]],
		[0x00, 0x1A, ["a", "(", "de", ")"]],
		[0x00, 0x3A, ["a", "(", "nn", ")"]],
		[0xED, 0x57, ["a", "i"]],
		[0xED, 0x5F, ["a", "r"]]
	],
	ld_group_4: [
		[0xED, 0x47, ["i", "a"]],
		[0xED, 0x4F, ["r", "a"]],
		[0x00, 0x01, ["ss", "nn"]],
		[0xDD, 0x21, ["ix", "nn"]],
		[0xFD, 0x21, ["iy", "nn"]],
		[0x00, 0x2A, ["hl", "(", "nn", ")"]],
		[0xED, 0x4B, ["ss", "(", "nn", ")"]],
		[0xDD, 0x2A, ["ix", "(", "nn", ")"]],
		[0xFD, 0x2A, ["iy", "(", "nn", ")"]],
		[0x00, 0xF9, ["sp", "hl"]],
		[0xDD, 0xF9, ["sp", "ix"]],
		[0xFD, 0xF9, ["sp", "iy"]]
	],
	push_pop_group_1: [
		[0x00, 0xC1, ["rr"]],
		[0xDD, 0xE1, ["ix"]],
		[0xFD, 0xE1, ["iy"]]
	],
	rlc_rl_rrc_rr_sla_sra_srl_group_1: [
		[0xCB, 0x00, ["r2"]],
		[0xCB, 0x06, ["(", "hl", ")"]],
		[0xDDCB, 0x06, ["(", "ix", "+", "dp", ")"]],
		[0xFDCB, 0x06, ["(", "iy", "+", "dp", ")"]]
	]
};

var MATCH_TABLES = {
	cc: ["nz", "z", "nc", "c", "po", "pe", "p", "m"],
	pp: ["bc", "de", "ix", "sp"],
	qq: ["bc", "de", "iy", "af"],
	r: ["b", "c", "d", "e", "h", "l", "a"],
	rr: ["bc", "de", "hl", "af"],
	ss: ["bc", "de", "hl", "sp"],
	vv: ["nz", "z", "nc", "c"]
};

function match_group(token, sym) {
	var i;
	if (sym === "r1" || sym === "r2") {
		i = MATCH_TABLES.r.indexOf(token);
		if (i === -1) return false;
		else if (i === 6) i++;

		if (sym === "r1") STATE.opcode_shifts.push(i << 3);
		else if (sym === "r2") STATE.opcode_shifts.push(i);

		return true;
	}
	else if (sym === "dp") {
		if (STATE.displacement < 0x00 || STATE.displacement > 0xFF) return false;
		return true;
	}
	else if (sym === "n" && token === "nn") {
		if (STATE.operand < 0x00 || STATE.operand > 0xFF) return false;
		STATE.operand_length = 1;
		return true;
	}
	else if (sym === "nn" && token === sym) {
                if (STATE.operand < 0x00 || STATE.operand > 0xFFFF) return false;
		STATE.operand_length = 2;
                return true;
        }
	else if (sym === "bt") {
		if (token < 0 || token > 7) return false;
		STATE.opcode_shifts.push(token << 3);
		return true;
	}
	else if (sym === "pp") {
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
	else if (sym === "cc") {
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

	return token === sym;
}

function find_pattern(tokens, patterns) {
	for (const p of patterns)
	{
		if (tokens.length !== p[2].length) continue;
		STATE.opcode_shifts = [];

		var matched = false;
		for (var i = 0; i < tokens.length; i++) {
			matched = match_group(tokens[i], p[2][i]);
			if (!matched) break;
		}

		if (matched) return p;
	}

	return null;
}

function add_adc_sub_sbc(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.add_adc_sub_sbc_group_1)) !== null) {
		opcode = pattern[1];
		if (mnemonic === "adc") opcode |= 8;
		else if (mnemonic === "sub") opcode |= 16;
		else if (mnemonic === "sbc") opcode |= 24;
	}
	else if (mnemonic === "add" && (pattern = find_pattern(tokens, PATTERNS.add_adc_sub_sbc_group_3)) !== null) {
		opcode = pattern[1];
	}
	else if (mnemonic !== "sub" && (pattern = find_pattern(tokens, PATTERNS.add_adc_sub_sbc_group_2)) !== null) {
		opcode = pattern[1];
	}

	if (opcode != null) {
		opcode = apply_opcode_shifts(opcode);
		return [pattern[0], opcode];
	}

	throw Error("Failed to match any pattern.");
}

function and_cp_or_xor(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.and_cp_or_xor_group_1)) !== null) {
		opcode = pattern[1];
		if (mnemonic === "xor") opcode |= 8;
		else if (mnemonic === "or") opcode |= 16;
		else opcode |= 24;

		opcode = apply_opcode_shifts(opcode);
		return [pattern[0], opcode];
	}

	throw Error("Failed to match any pattern.");
}

function bit_set_res(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.bit_set_res_group_1)) !== null) {
		opcode = pattern[1];
		if (mnemonic === "bit") opcode |= 64;
		else if (mnemonic == "res") opcode |= 128;
		else opcode |= 192;

		opcode = apply_opcode_shifts(opcode);
		return [pattern[0], opcode];
	}

	throw Error("Failed to match any pattern.");
}

function djnz_jp_jr(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
	if (mnemonic === "djnz" && (pattern = find_pattern(tokens, PATTERNS.djnz_jp_jr_group_1)) !== null) {
		opcode = pattern[1];
	}
	else if (mnemonic === "jp" && (pattern = find_pattern(tokens, PATTERNS.djnz_jp_jr_group_2)) !== null) {
		opcode = pattern[1];
	}
	else if (mnemonic === "jr" && (pattern = find_pattern(tokens, PATTERNS.djnz_jp_jr_group_3)) !== null) {
		opcode = pattern[1];
	}

	if (opcode !== null) {
		opcode = apply_opcode_shifts(opcode);
		return [pattern[0], opcode];
	}

	throw Error("Failed to match any pattern.");
}

function ex(mnemonic, tokens) {
	var pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.ex_group_1)) !== null) {
		return [pattern[0], pattern[1]];
	}

	throw Error("Failed to match any pattern.");
}

function im() {
	var pattern = null;
	if ((pattern = find_pattern(STATE.tokens, PATTERNS.im_group_1)) !== null) {
		return [pattern[0], pattern[1]];
	}

	throw Error("Failed to match any pattern.");
}

function inc_dec(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.inc_dec_group_1)) !== null) {
		opcode = pattern[1];
		if (mnemonic === "dec") opcode |= 1;
	}
	else if ((pattern = find_pattern(tokens, PATTERNS.inc_dec_group_2)) !== null) {
		opcode = pattern[1];
		if (mnemonic === "dec") opcode |= 8;
	}

	if (opcode !== null) {
		opcode = apply_opcode_shifts(opcode);
		return [pattern[0], opcode];
	}

	throw Error("Failed to match any pattern.");
}

function ld(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.ld_group_1)) !== null) {
		opcode = pattern[1];
	}
	else if (tokens[0] === "(" && (pattern = find_pattern(tokens, PATTERNS.ld_group_2)) !== null) {
		opcode = pattern[1];
	}
	else if (tokens[0] === "a" && (pattern = find_pattern(tokens, PATTERNS.ld_group_3)) !== null) {
		opcode = pattern[1];
	}
	else if ((pattern = find_pattern(tokens, PATTERNS.ld_group_4)) !== null) {
		opcode = pattern[1];
	}

	if (opcode !== null) {
		opcode = apply_opcode_shifts(opcode);
		return [pattern[0], opcode];
	}

	throw Error("Failed to match any pattern.");
}

function push_pop(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.push_pop_group_1)) !== null) {
		opcode = pattern[1];
		if (mnemonic === "pop") opcode |= 4;

		opcode = apply_opcode_shifts(opcode);
		return [pattern[0], opcode];
	}

	throw Error("Failed to match any pattern.");
}

function rlc_rl_rrc_rr_sla_sra_srl(mnemonic, tokens) {
	var opcode = null;
	var pattern = null;
	if ((pattern = find_pattern(tokens, PATTERNS.rlc_rl_rrc_rr_sla_sra_srl_group_1)) !== null) {
		opcode = pattern[1];
		if (mnemonic === "rrc") opcode |= 8;
		else if (mnemonic === "rl") opcode |= 16;
		else if (mnemonic === "rr") opcode |= 24;
		else if (mnemonic === "sla") opcode |= 32;
		else if (mnemonic === "sra") opcode |= 48;
		else if (mnemonic === "srl") opcode |= 56;

		opcode = apply_opcode_shifts(opcode);
		return [pattern[0], opcode];
	}

	throw Error("Failed to match any pattern.");
}

function apply_opcode_shifts(opcode) {
	for (var i = 0; i < STATE.opcode_shifts.length; i++) {
		opcode |= STATE.opcode_shifts[i];
	}

	return opcode;
}

function find_opcode(mnemonic, tokens) {
	if (tokens.length === 0) {
        	var mnem0 = MNEMONICS_0[mnemonic];
        	if (mnem0) {
			STATE.opcode = [mnem0.prefix, mnem0.opcode];
			return;
		}
	}

	var mnem1 = MNEMONICS_1[mnemonic];
	if (mnem1) {
		STATE.opcode = mnem1(mnemonic, tokens);
		return;
	}

	throw Error("Failed to match any mnemonic.");
}

function read_word() {
        STATE.current_word = '';

        while (STATE.line_buffer[STATE.line_cursor] === ' ' && STATE.line_cursor < STATE.line_buffer.length) {
                STATE.line_cursor++;
        }

        while (STATE.line_buffer[STATE.line_cursor] !== ' ' && STATE.line_cursor < STATE.line_buffer.length) {
                STATE.current_word += STATE.line_buffer[STATE.line_cursor];
                STATE.line_cursor++;
        }
}

function load_line_buffer(line) {
        STATE.line_buffer = '';
        STATE.line_cursor = 0;

        for (var i = 0; i < line.length; i++) {
                var c = line[i];
                if (c === ',') c = ' ';
                else if (c === '(') c = '( '
                else if (c === ')') c = ' )'
                else if (c === '+') c = ' + '
                STATE.line_buffer += c;
        }
}

function parse_line(str) {
	STATE.mnemonic = null;
	STATE.opcode = null;
	STATE.tokens = [];

	read_word();
	if (STATE.current_word !== '') {
		STATE.mnemonic = STATE.current_word;

		read_word();
		while (STATE.current_word !== '') {
			push_token(STATE.current_word);
			read_word();
		}
	}
}

function assemble(line) {
	load_line_buffer(line);
	parse_line(line);

	if (STATE.mnemonic === null) {
		return [];
	}

	find_opcode(STATE.mnemonic, STATE.tokens);

	if (STATE.opcode !== null) {
		var bytes = to_bytes(STATE.opcode[0]);
		bytes.push(STATE.opcode[1]);

		if (STATE.displacement !== null) {
			bytes.push(STATE.displacement);
		}

		if (STATE.operand !== null) {
			var op = STATE.operand;
			for (var i = 0; i < STATE.operand_length; i++) {
				var a = op & 0xFF;
				bytes.push(a);
				op >>= 8;
			}
		}

		return bytes;
	}
}

function to_bytes(n) {
	var b = [];
	while (n !== 0) {
		b.unshift(n & 0xFF);
		n >>= 8;
	}
	return b;
}

function get_state() {
	return STATE;
}

function push_token(token) {
	if (token[0] === '$') {
		var value = parseInt(token.substring(1), 16);
		var tlen = STATE.tokens.length;
		if (tlen > 0 && STATE.tokens[tlen - 1] === "+") {
			STATE.displacement = value;
			STATE.tokens.push('dp');
		}
		else {
			STATE.operand = value;
			STATE.tokens.push('nn');
		}
	}
	else {
		STATE.tokens.push(token);
	}
}

exports.assemble = assemble;
exports.get_state = get_state;
