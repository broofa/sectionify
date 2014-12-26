var fs = require('fs');
var stream = require('stream');

var Sectionify = require('./index.js');

function testThis(test, requires, input, expected) {
  var sectionStream = new Sectionify.Stream(requires);
  sectionStream.on('data', function(chunk) {
    var code = chunk.toString('utf8');
    test.equal(code, expected);
    test.done();
  });

  var instream = new stream.Readable();
  instream._read = function() {};
  instream.pipe(sectionStream);
  instream.push(input);
  instream.push(null);
}

exports.testPlain = function(test) {
  testThis(
    test,
    [],
    ['A', 'B', 'Z'].join('\n'),
    ['A', 'B', 'Z'].join('\n')
  );
};

exports.testInclusive = function(test) {
  testThis(
    test, ['foo'],
    [
      'A',
      '//SECTION foo',
      'B',
      '//SECTION',
      'Z'
    ].join('\n'),
    ['A', 'B', 'Z'].join('\n')
  );
};

exports.testExclusive = function(test) {
  testThis(
    test, ['foo'], [
      'A',
      '//SECTION foo',
      'B',
      '//SECTION bar',
      'C',
      '//SECTION',
      'Z'
    ].join('\n'),
    ['A', 'B', 'Z'].join('\n')
  );
};

exports.testMulti = function(test) {
  testThis(
    test, ['foo', 'bar'], [
      'A',
      '//SECTION foo',
      'B',
      '//SECTION bar',
      'C',
      '//SECTION',
      'Z'
    ].join('\n'),
    ['A', 'B', 'C', 'Z'].join('\n')
  );
};

exports.testNested = function(test) {
  testThis(
    test, ['foo'], [
      'A',
      '//SECTION foo REQUIRE bar',
      'B',
      '//SECTION bar',
      'C',
      '//SECTION',
      'Z'
    ].join('\n'),
    ['A', 'B', 'C', 'Z'].join('\n')
  );
};
