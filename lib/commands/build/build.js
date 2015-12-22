'use strict';

var addJQueryAdapterRegistration = require('metal-tools-build-jquery/lib/pipelines/addJQueryAdapterRegistration');
var buildAmd = require('metal-tools-build-amd/lib/pipelines/buildAmd');
var Command = require('../../Command');
var commandOptions = require('./options');
var consume = require('stream-consume');
var merge = require('merge');
var metalToolsBuildAmd = require('metal-tools-build-amd');
var metalToolsBuildGlobals = require('metal-tools-build-globals');
var metalToolsSoy = require('metal-tools-soy');
var soyOptions = require('../soy/options');
var vfs = require('vinyl-fs');

var namesToFn = {
  amd: metalToolsBuildAmd,
  'amd-jquery': buildAmdJQuery,
  globals: metalToolsBuildGlobals
};

Command.register({
  desc: 'Compiles ES2015 js files to the chosen ES5 format',

  name: 'build',

  run: function(options, callback) {
    var queue = [runSoy];
    for (var i = 0; i < options.format.length; i++) {
      queue.push(runBuild.bind(null, i));
    }
    runNext(queue, 0, options, callback);
  },

  yargs: function(yargs) {
    soyOptions = merge({}, soyOptions);
    soyOptions.soySrc = merge({}, soyOptions.s);
    delete soyOptions.soySrc.alias;
    soyOptions.soyDest = merge({}, soyOptions.d);
    delete soyOptions.soyDest.alias;
    delete soyOptions.s;
    delete soyOptions.d;

    return yargs
      .options(commandOptions)
      .options(soyOptions)
      .help('help')
      .argv;
  }
});

function buildAmdJQuery(options) {
  var stream = vfs.src(options.src, {base: options.base})
    .pipe(addJQueryAdapterRegistration())
		.pipe(buildAmd(options))
		.pipe(vfs.dest(options.dest || 'build/amd-jquery'));
  consume(stream);
  return stream;
}

function runBuild(index, options) {
  var format = options.format[index];
  options = merge({}, options);
  if (options.dest[index]) {
    options.dest = options.dest[index];
  } else {
    // If no destination directory was set for this build format,
    // let its default be used.
    delete options.dest;
  }
  return namesToFn[format](options);
}

function runNext(queue, index, options, callback) {
  queue[index](options).on('end', function() {
    if (index === queue.length - 1) {
      callback();
    } else {
      runNext(queue, index + 1, options, callback);
    }
  });
}

function runSoy(options) {
  options = merge({}, options, {
    src: options.soySrc,
    dest: options.soyDest
  });
  return metalToolsSoy(options);
}
