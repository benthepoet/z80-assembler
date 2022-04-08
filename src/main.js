var m = {
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

function assemble(str)
{
    var words = str.split(' ');
    var s = {
        m: ''
    };
    
    for (var i = 0; i < words.length; i++)
    {
        var word = words[i];
        
        if (/^\$\d{2}$/.test(word))
        {
            s.o = parseInt(word.slice(1), 16);
            s.table = m.zp;
        }
        else if (/^\$\d{4}$/.test(word))
        {
            s.o = parseInt(word.slice(1), 16);
            s.table = m.ab;
        }
        else {
            s.m += word;
        }
    }

    for (var op in s.table)
    {
        if (op === s.m)
        {
            return [s.table[op], ...[s.o]];
        }
    }

    throw new Error('Unknown');
}

var lines = [
    'adc $10',
    'lda $0200 y',
    'lda $0020 ',
    'lda $00 x'
];

var inter = lines
    .map(line => {
        try {
            return assemble(line);
        }
        catch {
            return 'INVALID';
        }
    });

console.log(inter);
