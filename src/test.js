var s = 'lda $0030, x';
var c = 0;

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

var a = read_word();
do { 
    console.log(a);
} while ((a = read_word()) !== '')

