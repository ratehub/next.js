"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/is-array"));

var _from = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/from"));

var _weakSet = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/weak-set"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/objectSpread"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _crypto = _interopRequireDefault(require("crypto"));

var _path = _interopRequireDefault(require("path"));

var _sourceMap = require("source-map");

var _webpackSources = require("webpack-sources");

var _RequestShortener = _interopRequireDefault(require("webpack/lib/RequestShortener"));

var _ModuleFilenameHelpers = _interopRequireDefault(require("webpack/lib/ModuleFilenameHelpers"));

var _serializeJavascript = _interopRequireDefault(require("serialize-javascript"));

var _package = _interopRequireDefault(require("terser/package.json"));

var _TaskRunner = _interopRequireDefault(require("./TaskRunner"));

/* eslint-disable
  no-param-reassign
*/
// import validateOptions from 'schema-utils';
// import schema from './options.json';
var warningRegex = /\[.+:([0-9]+),([0-9]+)\]/;

var TerserPlugin =
/*#__PURE__*/
function () {
  function TerserPlugin() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2.default)(this, TerserPlugin);
    // validateOptions(schema, options, 'Terser Plugin');
    var minify = options.minify,
        _options$terserOption = options.terserOptions,
        terserOptions = _options$terserOption === void 0 ? {} : _options$terserOption,
        _options$test = options.test,
        test = _options$test === void 0 ? /\.m?js(\?.*)?$/i : _options$test,
        _options$chunkFilter = options.chunkFilter,
        chunkFilter = _options$chunkFilter === void 0 ? function () {
      return true;
    } : _options$chunkFilter,
        _options$warningsFilt = options.warningsFilter,
        warningsFilter = _options$warningsFilt === void 0 ? function () {
      return true;
    } : _options$warningsFilt,
        _options$extractComme = options.extractComments,
        extractComments = _options$extractComme === void 0 ? false : _options$extractComme,
        _options$sourceMap = options.sourceMap,
        sourceMap = _options$sourceMap === void 0 ? false : _options$sourceMap,
        _options$cache = options.cache,
        cache = _options$cache === void 0 ? false : _options$cache,
        _options$cacheKeys = options.cacheKeys,
        cacheKeys = _options$cacheKeys === void 0 ? function (defaultCacheKeys) {
      return defaultCacheKeys;
    } : _options$cacheKeys,
        _options$parallel = options.parallel,
        parallel = _options$parallel === void 0 ? false : _options$parallel,
        include = options.include,
        exclude = options.exclude;
    this.options = {
      test: test,
      chunkFilter: chunkFilter,
      warningsFilter: warningsFilter,
      extractComments: extractComments,
      sourceMap: sourceMap,
      cache: cache,
      cacheKeys: cacheKeys,
      parallel: parallel,
      include: include,
      exclude: exclude,
      minify: minify,
      terserOptions: (0, _objectSpread2.default)({
        output: {
          comments: extractComments ? false : /^\**!|@preserve|@license|@cc_on/i
        }
      }, terserOptions)
    };
  }

  (0, _createClass2.default)(TerserPlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      var buildModuleFn = function buildModuleFn(moduleArg) {
        // to get detailed location info about errors
        moduleArg.useSourceMap = true;
      };

      var optimizeFn = function optimizeFn(compilation, chunks, callback) {
        var taskRunner = new _TaskRunner.default({
          cache: _this.options.cache,
          parallel: _this.options.parallel
        });
        var processedAssets = new _weakSet.default();
        var tasks = [];
        var chunkFilter = _this.options.chunkFilter;
        (0, _from.default)(chunks).filter(function (chunk) {
          return chunkFilter && chunkFilter(chunk);
        }).reduce(function (acc, chunk) {
          return acc.concat(chunk.files || []);
        }, []).concat(compilation.additionalChunkAssets || []).filter(_ModuleFilenameHelpers.default.matchObject.bind(null, _this.options)).forEach(function (file) {
          var inputSourceMap;
          var asset = compilation.assets[file];

          if (processedAssets.has(asset)) {
            return;
          }

          try {
            var input;

            if (_this.options.sourceMap && asset.sourceAndMap) {
              var _asset$sourceAndMap = asset.sourceAndMap(),
                  source = _asset$sourceAndMap.source,
                  map = _asset$sourceAndMap.map;

              input = source;

              if (TerserPlugin.isSourceMap(map)) {
                inputSourceMap = map;
              } else {
                inputSourceMap = map;
                compilation.warnings.push(new Error("".concat(file, " contains invalid source map")));
              }
            } else {
              input = asset.source();
              inputSourceMap = null;
            } // Handling comment extraction


            var commentsFile = false;

            if (_this.options.extractComments) {
              commentsFile = _this.options.extractComments.filename || "".concat(file, ".LICENSE");

              if (typeof commentsFile === 'function') {
                commentsFile = commentsFile(file);
              }
            }

            var task = {
              file: file,
              input: input,
              inputSourceMap: inputSourceMap,
              commentsFile: commentsFile,
              extractComments: _this.options.extractComments,
              terserOptions: _this.options.terserOptions,
              minify: _this.options.minify
            };

            if (_this.options.cache) {
              var defaultCacheKeys = {
                terser: _package.default.version,
                // eslint-disable-next-line global-require
                'terser-webpack-plugin': '1.2.2',
                'terser-webpack-plugin-options': _this.options,
                hash: _crypto.default.createHash('md4').update(input).digest('hex')
              };
              task.cacheKeys = _this.options.cacheKeys(defaultCacheKeys, file);
            }

            tasks.push(task);
          } catch (error) {
            compilation.errors.push(TerserPlugin.buildError(error, file, TerserPlugin.buildSourceMap(inputSourceMap), new _RequestShortener.default(compiler.context)));
          }
        });
        taskRunner.run(tasks, function (tasksError, results) {
          if (tasksError) {
            compilation.errors.push(tasksError);
            return;
          }

          results.forEach(function (data, index) {
            var _tasks$index = tasks[index],
                file = _tasks$index.file,
                input = _tasks$index.input,
                inputSourceMap = _tasks$index.inputSourceMap,
                commentsFile = _tasks$index.commentsFile;
            var error = data.error,
                map = data.map,
                code = data.code,
                warnings = data.warnings;
            var extractedComments = data.extractedComments;
            var sourceMap = null;

            if (error || warnings && warnings.length > 0) {
              sourceMap = TerserPlugin.buildSourceMap(inputSourceMap);
            } // Handling results
            // Error case: add errors, and go to next file


            if (error) {
              compilation.errors.push(TerserPlugin.buildError(error, file, sourceMap, new _RequestShortener.default(compiler.context)));
              return;
            }

            var outputSource;

            if (map) {
              outputSource = new _webpackSources.SourceMapSource(code, file, JSON.parse(map), input, inputSourceMap);
            } else {
              outputSource = new _webpackSources.RawSource(code);
            } // Write extracted comments to commentsFile


            if (commentsFile && extractedComments && extractedComments.length > 0) {
              if (commentsFile in compilation.assets) {
                var commentsFileSource = compilation.assets[commentsFile].source();
                extractedComments = extractedComments.filter(function (comment) {
                  return !commentsFileSource.includes(comment);
                });
              }

              if (extractedComments.length > 0) {
                // Add a banner to the original file
                if (_this.options.extractComments.banner !== false) {
                  var banner = _this.options.extractComments.banner || "For license information please see ".concat(_path.default.posix.basename(commentsFile));

                  if (typeof banner === 'function') {
                    banner = banner(commentsFile);
                  }

                  if (banner) {
                    outputSource = new _webpackSources.ConcatSource("/*! ".concat(banner, " */\n"), outputSource);
                  }
                }

                var commentsSource = new _webpackSources.RawSource("".concat(extractedComments.join('\n\n'), "\n"));

                if (commentsFile in compilation.assets) {
                  // commentsFile already exists, append new comments...
                  if (compilation.assets[commentsFile] instanceof _webpackSources.ConcatSource) {
                    compilation.assets[commentsFile].add('\n');
                    compilation.assets[commentsFile].add(commentsSource);
                  } else {
                    compilation.assets[commentsFile] = new _webpackSources.ConcatSource(compilation.assets[commentsFile], '\n', commentsSource);
                  }
                } else {
                  compilation.assets[commentsFile] = commentsSource;
                }
              }
            } // Updating assets


            processedAssets.add(compilation.assets[file] = outputSource); // Handling warnings

            if (warnings && warnings.length > 0) {
              warnings.forEach(function (warning) {
                var builtWarning = TerserPlugin.buildWarning(warning, file, sourceMap, new _RequestShortener.default(compiler.context), _this.options.warningsFilter);

                if (builtWarning) {
                  compilation.warnings.push(builtWarning);
                }
              });
            }
          });
          taskRunner.exit();
          callback();
        });
      };

      var plugin = {
        name: this.constructor.name
      };
      compiler.hooks.compilation.tap(plugin, function (compilation) {
        if (_this.options.sourceMap) {
          compilation.hooks.buildModule.tap(plugin, buildModuleFn);
        }

        var mainTemplate = compilation.mainTemplate,
            chunkTemplate = compilation.chunkTemplate; // Regenerate `contenthash` for minified assets

        for (var _i = 0, _arr = [mainTemplate, chunkTemplate]; _i < _arr.length; _i++) {
          var template = _arr[_i];
          template.hooks.hashForChunk.tap(plugin, function (hash) {
            var data = (0, _serializeJavascript.default)({
              terser: _package.default.version,
              terserOptions: _this.options.terserOptions
            });
            hash.update('TerserPlugin');
            hash.update(data);
          });
        }

        compilation.hooks.optimizeChunkAssets.tapAsync(plugin, optimizeFn.bind(_this, compilation));
      });
    }
  }], [{
    key: "isSourceMap",
    value: function isSourceMap(input) {
      // All required options for `new SourceMapConsumer(...options)`
      // https://github.com/mozilla/source-map#new-sourcemapconsumerrawsourcemap
      return Boolean(input && input.version && input.sources && (0, _isArray.default)(input.sources) && typeof input.mappings === 'string');
    }
  }, {
    key: "buildSourceMap",
    value: function buildSourceMap(inputSourceMap) {
      if (!inputSourceMap || !TerserPlugin.isSourceMap(inputSourceMap)) {
        return null;
      }

      return new _sourceMap.SourceMapConsumer(inputSourceMap);
    }
  }, {
    key: "buildError",
    value: function buildError(err, file, sourceMap, requestShortener) {
      // Handling error which should have line, col, filename and message
      if (err.line) {
        var original = sourceMap && sourceMap.originalPositionFor({
          line: err.line,
          column: err.col
        });

        if (original && original.source && requestShortener) {
          return new Error("".concat(file, " from Terser\n").concat(err.message, " [").concat(requestShortener.shorten(original.source), ":").concat(original.line, ",").concat(original.column, "][").concat(file, ":").concat(err.line, ",").concat(err.col, "]"));
        }

        return new Error("".concat(file, " from Terser\n").concat(err.message, " [").concat(file, ":").concat(err.line, ",").concat(err.col, "]"));
      } else if (err.stack) {
        return new Error("".concat(file, " from Terser\n").concat(err.stack));
      }

      return new Error("".concat(file, " from Terser\n").concat(err.message));
    }
  }, {
    key: "buildWarning",
    value: function buildWarning(warning, file, sourceMap, requestShortener, warningsFilter) {
      var warningMessage = warning;
      var locationMessage = '';
      var source = null;

      if (sourceMap) {
        var match = warningRegex.exec(warning);

        if (match) {
          var line = +match[1];
          var column = +match[2];
          var original = sourceMap.originalPositionFor({
            line: line,
            column: column
          });

          if (original && original.source && original.source !== file && requestShortener) {
            source = original.source;
            warningMessage = "".concat(warningMessage.replace(warningRegex, ''));
            locationMessage = "[".concat(requestShortener.shorten(original.source), ":").concat(original.line, ",").concat(original.column, "]");
          }
        }
      }

      if (warningsFilter && !warningsFilter(warning, source)) {
        return null;
      }

      return "Terser Plugin: ".concat(warningMessage).concat(locationMessage);
    }
  }]);
  return TerserPlugin;
}();

var _default = TerserPlugin;
exports.default = _default;