"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const integer_literals_1 = require("./integer-literals");
const ZEROES = '0x0000000000000000000000000000000000000000000000000000000000000000';
(0, ava_1.default)('falsy', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)(undefined), ZEROES);
    t.is((0, integer_literals_1.normalizeUint256Literal)(null), ZEROES);
    t.is((0, integer_literals_1.normalizeUint256Literal)(''), ZEROES);
});
(0, ava_1.default)('hex', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)('0x12e3'), '0x00000000000000000000000000000000000000000000000000000000000012e3');
});
(0, ava_1.default)('hex - leading zeroes', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)('0x0012e3'), '0x00000000000000000000000000000000000000000000000000000000000012e3');
});
(0, ava_1.default)('hex - capital', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)('0x12E3'), '0x00000000000000000000000000000000000000000000000000000000000012e3');
});
(0, ava_1.default)('decimal', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)('1234'), '0x00000000000000000000000000000000000000000000000000000000000004d2');
});
(0, ava_1.default)('zeroes', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)('0'), ZEROES);
    t.is((0, integer_literals_1.normalizeUint256Literal)('0x000'), ZEROES);
    t.is((0, integer_literals_1.normalizeUint256Literal)(ZEROES), ZEROES);
    t.is((0, integer_literals_1.normalizeUint256Literal)('-0'), ZEROES);
});
(0, ava_1.default)('underscores', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)('1_23_4'), '0x00000000000000000000000000000000000000000000000000000000000004d2');
});
(0, ava_1.default)('scientific notation', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)('20e10'), '0x0000000000000000000000000000000000000000000000000000002e90edd000');
});
(0, ava_1.default)('scientific notation - capital', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)('20E10'), '0x0000000000000000000000000000000000000000000000000000002e90edd000');
});
(0, ava_1.default)('scientific notation - fractional base', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)('2.5e3'), '0x00000000000000000000000000000000000000000000000000000000000009c4');
});
(0, ava_1.default)('scientific notation - negative exponent', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)('250000e-2'), '0x00000000000000000000000000000000000000000000000000000000000009c4');
});
(0, ava_1.default)('scientific notation - invalid integer literal', t => {
    const error = t.throws(() => (0, integer_literals_1.normalizeUint256Literal)('2e-3'));
    t.is(error?.message, 'Invalid integer literal: 2e-3');
});
(0, ava_1.default)('full hex', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'), '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
});
(0, ava_1.default)('full hex with leading and trailing zeroes', t => {
    t.is((0, integer_literals_1.normalizeUint256Literal)('0x00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00'), '0x00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00');
});
//# sourceMappingURL=integer-literals.test.js.map