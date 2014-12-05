# sectionify.js #

A CLI for building API-specific versions of single-file JS libraries

## How It Works ##

Declare code sections and dependencies with `//SECTION` comments:

In `sample.js`:

    var a = 'leading code is always included';
    //SECTION foo
    function hello(msg) {console.log('hello ' + msg);}
    //SECTION bar REQUIRES foo
    hello('do bar things');
    //SECTION baz REQUIRES foo
    hello('do baz things');
    //SECTION
    var b = 'trailing code is always included';

Then build section-specific scripts with `sectionify`.  Only the required sections are kept:

    > sectionify sample.js foo

    var a = 'leading code is always included';
    function hello(msg) {console.log('hello ' + msg);}
    var b = 'trailing code is always included';

`REQUIRE`ed sections get included for you:

    > sectionify sample.js narf

    var a = 'leading code is always included';
    function hello(msg) {console.log('hello ' + msg);}
    hello('do bar things');
    hello('do baz things');
    hello('do narf things');
    var b = 'trailing code is always included';

Build with multiple sections:

    > `sectionify sample.js bar baz`

    var a = 'leading code is always included';
    function hello(msg) {console.log('hello ' + msg);}
    hello('do bar things');
    hello('do baz things');
    var b = 'trailing code is always included';
