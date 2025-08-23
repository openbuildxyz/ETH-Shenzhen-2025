"use strict";

exports.__esModule = true;
exports["default"] = cryptoSecureRandomInt;
var _getRandomValues = _interopRequireDefault(require("./getRandomValues"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/*
 * Cryptographically secure pseudorandom number generator
 * As Math.random() is cryptographically not safe to use
 */
function cryptoSecureRandomInt() {
  return (0, _getRandomValues["default"])(new Uint32Array(1))[0];
}