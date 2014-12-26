#!/usr/bin/env node
// Copyright (c) 2010-2012 Robert Kieffer
var Transform = require('stream').Transform;
var util = require('util');

function Stream(requires) {
  if (!(this instanceof Stream))
    return new Stream(requires);

  Transform.call(this, {});

  this._requires = requires;
  this._input = [];
}
util.inherits(Stream, Transform);

Stream.prototype._transform = function(chunk, encoding, done) {
  this._input.push(chunk.toString('utf8'));
  done();
};

Stream.prototype._flush = function(chunk) {
  this.lines = this._input.join('').split('\n');
  var sections = {};

  // Identify sections in input
  this.lines = this.lines.map(function(line, lineno) {
    if (/^\s*\/\/SECTION/.test(line)) {
      var fields = line.split(/\W+/);
      var name = fields[2];
      var section = {
        name: name,
        line: lineno,
        requires: fields[3] == 'REQUIRE' ? fields.slice(4) : []
      };
      if (name) {
        sections[name] = section;
      }
      return section;
    }

    return line;
  }.bind(this));

  // Resolve dependencies
  var requires = this._requires;
  for (var i = 0; i < requires.length; i++) {
    var section = sections[requires[i]];
    if (section && section.name && section.requires) {
      section.requires.forEach(function(sectionName) {
        if (requires.indexOf(sectionName) < 0) {
          requires.push(sectionName);
        }
      });
    }
  }

  // Gather required sections
  var include = true;
  var out = this.lines.filter(function(line, lineno) {
    if (typeof(line) !== 'string') {
      include = ~requires.indexOf(line.name) || (!line.name);
      return false;
    }
    return include;
  });

  // Output as string
  this.push(out.join('\n'));
};

exports.Stream = Stream;
