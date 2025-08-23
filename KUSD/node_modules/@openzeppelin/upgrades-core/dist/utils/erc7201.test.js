"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const erc7201_1 = require("./erc7201");
(0, ava_1.default)('calculateERC7201StorageLocation', t => {
    t.is((0, erc7201_1.calculateERC7201StorageLocation)('example.main'), '0x183a6125c38840424c4a85fa12bab2ab606c4b6d0e7cc73c0c06ba5300eab500');
});
//# sourceMappingURL=erc7201.test.js.map