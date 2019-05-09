"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs2/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

var _getIterator2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/get-iterator"));

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));

var _del = _interopRequireDefault(require("del"));

var _recursiveCopy = _interopRequireDefault(require("recursive-copy"));

var _mkdirpThen = _interopRequireDefault(require("mkdirp-then"));

var _path = require("path");

var _fs = require("fs");

var _newrelic = _interopRequireDefault(require("newrelic"));

var _config = _interopRequireDefault(require("../server/config"));

var _constants = require("../lib/constants");

var _render = require("../server/render");

var _asset = require("../lib/asset");

var envConfig = _interopRequireWildcard(require("../lib/runtime-config"));

function _default(_x, _x2, _x3) {
  return _ref.apply(this, arguments);
}

function _ref() {
  _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(dir, options, configuration) {
    var log, nextConfig, distDir, buildId, pagesManifest, pages, defaultPathMap, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, page, outDir, renderOpts, serverRuntimeConfig, publicRuntimeConfig, exportPathMap, exportPaths, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _loop, _iterator2, _step2;

    return _regenerator.default.wrap(function _callee3$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            log = function _ref4(message) {
              if (options.silent) return;
              console.log(message);
            };

            dir = (0, _path.resolve)(dir);
            nextConfig = configuration || (0, _config.default)(_constants.PHASE_EXPORT, dir);
            distDir = (0, _path.join)(dir, nextConfig.distDir);
            log("> using build directory: ".concat(distDir));

            if ((0, _fs.existsSync)(distDir)) {
              _context4.next = 7;
              break;
            }

            throw new Error("Build directory ".concat(distDir, " does not exist. Make sure you run \"next build\" before running \"next start\" or \"next export\"."));

          case 7:
            buildId = (0, _fs.readFileSync)((0, _path.join)(distDir, _constants.BUILD_ID_FILE), 'utf8');
            pagesManifest = require((0, _path.join)(distDir, _constants.SERVER_DIRECTORY, _constants.PAGES_MANIFEST));
            pages = (0, _keys.default)(pagesManifest);
            defaultPathMap = {};
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context4.prev = 14;
            _iterator = (0, _getIterator2.default)(pages);

          case 16:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context4.next = 27;
              break;
            }

            page = _step.value;

            if (!(page === '/_document' || page === '/_app')) {
              _context4.next = 20;
              break;
            }

            return _context4.abrupt("continue", 24);

          case 20:
            if (!(page === '/_error')) {
              _context4.next = 23;
              break;
            }

            defaultPathMap['/404'] = {
              page: page
            };
            return _context4.abrupt("continue", 24);

          case 23:
            defaultPathMap[page] = {
              page: page
            };

          case 24:
            _iteratorNormalCompletion = true;
            _context4.next = 16;
            break;

          case 27:
            _context4.next = 33;
            break;

          case 29:
            _context4.prev = 29;
            _context4.t0 = _context4["catch"](14);
            _didIteratorError = true;
            _iteratorError = _context4.t0;

          case 33:
            _context4.prev = 33;
            _context4.prev = 34;

            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }

          case 36:
            _context4.prev = 36;

            if (!_didIteratorError) {
              _context4.next = 39;
              break;
            }

            throw _iteratorError;

          case 39:
            return _context4.finish(36);

          case 40:
            return _context4.finish(33);

          case 41:
            // Initialize the output directory
            outDir = options.outdir;
            _context4.next = 44;
            return (0, _del.default)((0, _path.join)(outDir, '*'));

          case 44:
            _context4.next = 46;
            return (0, _mkdirpThen.default)((0, _path.join)(outDir, '_next', buildId));

          case 46:
            if (!(0, _fs.existsSync)((0, _path.join)(dir, 'static'))) {
              _context4.next = 50;
              break;
            }

            log('  copying "static" directory');
            _context4.next = 50;
            return (0, _recursiveCopy.default)((0, _path.join)(dir, 'static'), (0, _path.join)(outDir, 'static'), {
              expand: true
            });

          case 50:
            if (!(0, _fs.existsSync)((0, _path.join)(distDir, _constants.CLIENT_STATIC_FILES_PATH))) {
              _context4.next = 54;
              break;
            }

            log('  copying "static build" directory');
            _context4.next = 54;
            return (0, _recursiveCopy.default)((0, _path.join)(distDir, _constants.CLIENT_STATIC_FILES_PATH), (0, _path.join)(outDir, '_next', _constants.CLIENT_STATIC_FILES_PATH));

          case 54:
            // Get the exportPathMap from the config file
            if (typeof nextConfig.exportPathMap !== 'function') {
              console.log("> No \"exportPathMap\" found in \"".concat(_constants.CONFIG_FILE, "\". Generating map from \"./pages\""));

              nextConfig.exportPathMap =
              /*#__PURE__*/
              function () {
                var _ref2 = (0, _asyncToGenerator2.default)(
                /*#__PURE__*/
                _regenerator.default.mark(function _callee(defaultMap) {
                  return _regenerator.default.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          return _context.abrupt("return", defaultMap);

                        case 1:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                }));

                return function (_x4) {
                  return _ref2.apply(this, arguments);
                };
              }();
            } // Start the rendering process


            renderOpts = {
              dir: dir,
              buildId: buildId,
              nextExport: true,
              assetPrefix: nextConfig.assetPrefix.replace(/\/$/, ''),
              distDir: distDir,
              dev: false,
              staticMarkup: false,
              hotReloader: null
            };
            serverRuntimeConfig = nextConfig.serverRuntimeConfig, publicRuntimeConfig = nextConfig.publicRuntimeConfig;

            if (publicRuntimeConfig) {
              renderOpts.runtimeConfig = publicRuntimeConfig;
            }

            envConfig.setConfig({
              serverRuntimeConfig: serverRuntimeConfig,
              publicRuntimeConfig: publicRuntimeConfig
            }); // set the assetPrefix to use for 'next/asset'

            (0, _asset.setAssetPrefix)(renderOpts.assetPrefix); // We need this for server rendering the Link component.

            global.__NEXT_DATA__ = {
              nextExport: true
            };
            _context4.next = 63;
            return nextConfig.exportPathMap(defaultPathMap, {
              dev: false,
              dir: dir,
              outDir: outDir,
              distDir: distDir,
              buildId: buildId
            });

          case 63:
            exportPathMap = _context4.sent;
            exportPaths = (0, _keys.default)(exportPathMap);
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context4.prev = 68;
            _loop =
            /*#__PURE__*/
            _regenerator.default.mark(function _loop() {
              var path, _exportPathMap$path, page, _exportPathMap$path$q, query, req, res, htmlFilename, baseDir, htmlFilepath, html;

              return _regenerator.default.wrap(function _loop$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      path = _step2.value;
                      log("> exporting path: ".concat(path));

                      if (path.startsWith('/')) {
                        _context3.next = 4;
                        break;
                      }

                      throw new Error("path \"".concat(path, "\" doesn't start with a backslash"));

                    case 4:
                      _exportPathMap$path = exportPathMap[path], page = _exportPathMap$path.page, _exportPathMap$path$q = _exportPathMap$path.query, query = _exportPathMap$path$q === void 0 ? {} : _exportPathMap$path$q;
                      req = {
                        url: path
                      };
                      res = {};
                      htmlFilename = "".concat(path).concat(_path.sep, "index.html");

                      if ((0, _path.extname)(path) !== '') {
                        // If the path has an extension, use that as the filename instead
                        htmlFilename = path;
                      } else if (path === '/') {
                        // If the path is the root, just use index.html
                        htmlFilename = 'index.html';
                      }

                      baseDir = (0, _path.join)(outDir, (0, _path.dirname)(htmlFilename));
                      htmlFilepath = (0, _path.join)(outDir, htmlFilename);
                      _context3.next = 13;
                      return (0, _mkdirpThen.default)(baseDir);

                    case 13:
                      _context3.next = 15;
                      return _newrelic.default.startBackgroundTransaction(page === '/' ? '/index' : page,
                      /*#__PURE__*/
                      (0, _asyncToGenerator2.default)(
                      /*#__PURE__*/
                      _regenerator.default.mark(function _callee2() {
                        var trans;
                        return _regenerator.default.wrap(function _callee2$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
                                trans = _newrelic.default.getTransaction();

                                _newrelic.default.addCustomAttribute('url', req.url);

                                _newrelic.default.addCustomAttribute('query', query);

                                return _context2.abrupt("return", function (t) {
                                  return (0, _render.renderToHTML)(req, res, page, query, renderOpts).then(function (html) {
                                    return new _promise.default(function (resolve, reject) {
                                      t.end(function () {
                                        resolve(html);
                                      });
                                    });
                                  });
                                }(trans));

                              case 4:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        }, _callee2);
                      })));

                    case 15:
                      html = _context3.sent;
                      (0, _fs.writeFileSync)(htmlFilepath, html, 'utf8');

                    case 17:
                    case "end":
                      return _context3.stop();
                  }
                }
              }, _loop);
            });
            _iterator2 = (0, _getIterator2.default)(exportPaths);

          case 71:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context4.next = 76;
              break;
            }

            return _context4.delegateYield(_loop(), "t1", 73);

          case 73:
            _iteratorNormalCompletion2 = true;
            _context4.next = 71;
            break;

          case 76:
            _context4.next = 82;
            break;

          case 78:
            _context4.prev = 78;
            _context4.t2 = _context4["catch"](68);
            _didIteratorError2 = true;
            _iteratorError2 = _context4.t2;

          case 82:
            _context4.prev = 82;
            _context4.prev = 83;

            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }

          case 85:
            _context4.prev = 85;

            if (!_didIteratorError2) {
              _context4.next = 88;
              break;
            }

            throw _iteratorError2;

          case 88:
            return _context4.finish(85);

          case 89:
            return _context4.finish(82);

          case 90:
            // Add an empty line to the console for the better readability.
            log('');

          case 91:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee3, null, [[14, 29, 33, 41], [34,, 36, 40], [68, 78, 82, 90], [83,, 85, 89]]);
  }));
  return _ref.apply(this, arguments);
}