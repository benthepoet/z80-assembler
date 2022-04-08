var types = {
    zpage: 'zpage',
    x: 'x'
};

var mnemonics = {
    lda: [
        [[types.zpage, types.x], 'B5']
    ],
    adc: [
        [[types.zpage], '65']
    ]
};

function assemble(str)
{
    var words = str.split(' ');
    var instr = {};
    for (var i = 0; i < words.length; i++)
    {
        for (var key in mnemonics)
        {
            if (key === words[i])
            {
                var next = i + 1;
                if (next < words.length)
                {
                    var params = words
                        .slice(next)
                        .map((item) => {
                            if (item == '$00')
                            {
                                return types.zpage;
                            }
                            else if (item == 'x')
                            {
                                return types.x;
                            }

                            return 'unknown';
                        });

                    for (var pair of mnemonics[key])
                    {
                        var [p, opcode] = pair;
                        if (JSON.stringify(params) == JSON.stringify(p)) {
                            instr = {
                                mnemonic: key,
                                params: params,
                                opcode: opcode
                            };

                            break;
                        }
                    }
                }
                
                break;
            }
        }

        if (!instr.mnemonic)
        {
            throw new Error(`Couldn't find mnemonic for ${words[i]}`);
        }

        break;
    }

    return instr;
}

var lines = [
    'adc $00',
    'lda $00 y',
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
