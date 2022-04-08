var mnemonics = {
    im: {
    },
    zp: {
        adc: 0x65,
        lda: 0x00,
        ldax: 0xB5
    },
    ab: {
        lda: 0xAD,
        lday: 0xB9
    }
};

function parseHex(str)
{
    return parseInt(str, 16);
}

function assemble(str)
{
    var words = str.split(' ');
    var instruction = {
        mnemonic: '',
        operand: null,
        table: null
    };
    
    for (var i = 0; i < words.length; i++)
    {
        var word = words[i];
        
        if (/^\$\d{2}$/.test(word))
        {
            instruction.operand = parseHex(word.slice(1));
            instruction.table = mnemonics.zp;
        }
        else if (/^\$\d{4}$/.test(word))
        {
            instruction.operand = parseHex(word.slice(1));
            instruction.table = mnemonics.ab;
        }
        else {
            instruction.mnemonic += word;
        }
    }

    for (var mnemonic in instruction.table)
    {
        if (mnemonic === instruction.mnemonic)
        {
            return [instruction.table[mnemonic], instruction.operand];
        }
    }

    throw new Error(`Failed assembling '${str}'`);
}

var lines = [
    'adc $10',
    'lda $0200 y',
    'lda $0020',
    'lda $00 x',
    'ldx $00'
];

var inter = lines
    .map(line => {
        try {
            return assemble(line);
        }
        catch (err) {
            return err.message;
        }
    });

console.log(inter);
