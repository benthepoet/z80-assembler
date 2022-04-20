var s = 'lda <$0030 $0400 ->, x';
var c = 0;

var num_stack = [];

function read_word()
{
    for (var i = c; i <= s.length; i++)
    {
        if (i == s.length || s[i] == ' ')
        {
            if (i - c > 0)
            {
                var t = c;
                c = i;
                return s.substring(t, i);
            }
            c++;
        }
    }

    return '';
}

function read()
{
    // read token
    // if operator then evaluate number stack
    // if comma 
    
    // read hex
    // read label

    // store numbers in a stack

    // if operator is present apply to stack
    // set operand to top of number stack
}

var a = read_word();
do { 
    console.log(a);
} while ((a = read_word()) !== '')

