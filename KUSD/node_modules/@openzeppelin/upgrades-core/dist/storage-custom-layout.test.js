"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const utils_1 = require("solidity-ast/utils");
const hardhat_1 = require("hardhat");
const storage_1 = require("./storage");
const extract_1 = require("./storage/extract");
const stabilize_layout_1 = require("./utils/stabilize-layout");
const test = ava_1.default;
test.before(async (t) => {
    const buildInfo = await hardhat_1.artifacts.getBuildInfo('contracts/test/CustomLayout.sol:CustomLayout');
    if (buildInfo === undefined) {
        throw new Error('Build info not found');
    }
    const solcOutput = buildInfo.output;
    const contracts = {};
    const storageLayouts = {};
    for (const def of (0, utils_1.findAll)('ContractDefinition', solcOutput.sources['contracts/test/CustomLayout.sol'].ast)) {
        contracts[def.name] = def;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        storageLayouts[def.name] = solcOutput.contracts['contracts/test/CustomLayout.sol'][def.name].storageLayout;
    }
    const deref = (0, utils_1.astDereferencer)(solcOutput);
    t.context.extractStorageLayout = name => (0, extract_1.extractStorageLayout)(contracts[name], dummyDecodeSrc, deref, storageLayouts[name]);
    // For testing fallback behavior when storage layout is missing from compilation output
    t.context.extractStorageLayoutFallback = name => (0, extract_1.extractStorageLayout)(contracts[name], dummyDecodeSrc, deref, undefined);
});
const dummyDecodeSrc = () => 'file.sol:1';
test('CustomLayout', t => {
    const layout = t.context.extractStorageLayout('CustomLayout');
    t.snapshot((0, stabilize_layout_1.stabilizeStorageLayout)(layout));
});
test('CustomLayout - fallback', t => {
    const layout = t.context.extractStorageLayoutFallback('CustomLayout');
    t.snapshot((0, stabilize_layout_1.stabilizeStorageLayout)(layout));
});
test('CustomLayout same root - ok', t => {
    const v1 = t.context.extractStorageLayout('CustomLayout');
    const v2 = t.context.extractStorageLayout('CustomLayout_Same_Root_Ok');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.deepEqual(comparison, []);
});
test('CustomLayout same root - fallback - ok', t => {
    const v1 = t.context.extractStorageLayoutFallback('CustomLayout');
    const v2 = t.context.extractStorageLayoutFallback('CustomLayout_Same_Root_Ok');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.deepEqual(comparison, []);
});
test('CustomLayout same root decimal - ok', t => {
    const v1 = t.context.extractStorageLayout('CustomLayout');
    const v2 = t.context.extractStorageLayout('CustomLayout_Same_Root_Decimal_Ok');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.deepEqual(comparison, []);
});
test('CustomLayout same root decimal - fallback - ok', t => {
    const v1 = t.context.extractStorageLayoutFallback('CustomLayout');
    const v2 = t.context.extractStorageLayoutFallback('CustomLayout_Same_Root_Decimal_Ok');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.deepEqual(comparison, []);
});
test('CustomLayout same root scientific notation - ok', t => {
    const v1 = t.context.extractStorageLayout('CustomLayout');
    const v2 = t.context.extractStorageLayout('CustomLayout_Same_Root_ScientificNotation_Ok');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.deepEqual(comparison, []);
});
test('CustomLayout same root scientific notation - fallback - ok', t => {
    const v1 = t.context.extractStorageLayoutFallback('CustomLayout');
    const v2 = t.context.extractStorageLayoutFallback('CustomLayout_Same_Root_ScientificNotation_Ok');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.deepEqual(comparison, []);
});
test('CustomLayout changed root - bad', t => {
    const v1 = t.context.extractStorageLayout('CustomLayout');
    const v2 = t.context.extractStorageLayout('CustomLayout_Changed_Root_Bad');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.like(comparison, {
        length: 2,
        0: {
            kind: 'layoutchange',
            change: {
                slot: {
                    from: '1',
                    to: '2',
                },
            },
            original: { label: 'x' },
            updated: { label: 'x' },
        },
        1: {
            kind: 'layoutchange',
            change: {
                slot: {
                    from: '2',
                    to: '3',
                },
            },
            original: { label: 'y' },
            updated: { label: 'y' },
        },
    });
});
test('CustomLayout changed root - fallback - bad', t => {
    const v1 = t.context.extractStorageLayoutFallback('CustomLayout');
    const v2 = t.context.extractStorageLayoutFallback('CustomLayout_Changed_Root_Bad');
    const error = t.throws(() => (0, storage_1.getStorageUpgradeErrors)(v1, v2));
    t.snapshot(error?.message);
});
test('CustomLayout changed root decimal - bad', t => {
    const v1 = t.context.extractStorageLayout('CustomLayout');
    const v2 = t.context.extractStorageLayout('CustomLayout_Changed_Root_Decimal_Bad');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.like(comparison, {
        length: 2,
        0: {
            kind: 'layoutchange',
            change: {
                slot: {
                    from: '1',
                    to: '2',
                },
            },
            original: { label: 'x' },
            updated: { label: 'x' },
        },
        1: {
            kind: 'layoutchange',
            change: {
                slot: {
                    from: '2',
                    to: '3',
                },
            },
            original: { label: 'y' },
            updated: { label: 'y' },
        },
    });
});
test('CustomLayout changed root decimal - fallback - bad', t => {
    const v1 = t.context.extractStorageLayoutFallback('CustomLayout');
    const v2 = t.context.extractStorageLayoutFallback('CustomLayout_Changed_Root_Decimal_Bad');
    const error = t.throws(() => (0, storage_1.getStorageUpgradeErrors)(v1, v2));
    t.snapshot(error?.message);
});
test('CustomLayout changed root scientific notation - bad', t => {
    const v1 = t.context.extractStorageLayout('CustomLayout');
    const v2 = t.context.extractStorageLayout('CustomLayout_Changed_Root_ScientificNotation_Bad');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.like(comparison, {
        length: 2,
        0: {
            kind: 'layoutchange',
            change: {
                slot: {
                    from: '1',
                    to: '20000000000',
                },
            },
            original: { label: 'x' },
            updated: { label: 'x' },
        },
        1: {
            kind: 'layoutchange',
            change: {
                slot: {
                    from: '2',
                    to: '20000000001',
                },
            },
            original: { label: 'y' },
            updated: { label: 'y' },
        },
    });
});
test('CustomLayout changed root scientific notation - fallback - bad', t => {
    const v1 = t.context.extractStorageLayoutFallback('CustomLayout');
    const v2 = t.context.extractStorageLayoutFallback('CustomLayout_Changed_Root_ScientificNotation_Bad');
    const error = t.throws(() => (0, storage_1.getStorageUpgradeErrors)(v1, v2));
    t.snapshot(error?.message);
});
test('CustomLayout changed to default - bad', t => {
    const v1 = t.context.extractStorageLayout('CustomLayout');
    const v2 = t.context.extractStorageLayout('CustomLayout_Changed_To_Default_Bad');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.like(comparison, {
        length: 2,
        0: {
            kind: 'layoutchange',
            change: {
                slot: {
                    from: '1',
                    to: '0',
                },
            },
            original: { label: 'x' },
            updated: { label: 'x' },
        },
        1: {
            kind: 'layoutchange',
            change: {
                slot: {
                    from: '2',
                    to: '1',
                },
            },
            original: { label: 'y' },
            updated: { label: 'y' },
        },
    });
});
test('CustomLayout changed to default - fallback - bad', t => {
    const v1 = t.context.extractStorageLayoutFallback('CustomLayout');
    const v2 = t.context.extractStorageLayoutFallback('CustomLayout_Changed_To_Default_Bad');
    const error = t.throws(() => (0, storage_1.getStorageUpgradeErrors)(v1, v2));
    t.snapshot(error?.message);
});
test('CustomLayout changed root - ok', t => {
    const v1 = t.context.extractStorageLayout('CustomLayout');
    const v2 = t.context.extractStorageLayout('CustomLayout_Changed_Root_Ok');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.deepEqual(comparison, []);
});
test('CustomLayout changed root - fallback - bad (no layout info)', t => {
    const v1 = t.context.extractStorageLayoutFallback('CustomLayout');
    const v2 = t.context.extractStorageLayoutFallback('CustomLayout_Changed_Root_Ok');
    const error = t.throws(() => (0, storage_1.getStorageUpgradeErrors)(v1, v2));
    t.snapshot(error?.message);
});
test('CustomLayout changed root - fallback - unsafeSkipStorageCheck', t => {
    const v1 = t.context.extractStorageLayoutFallback('CustomLayout');
    const v2 = t.context.extractStorageLayoutFallback('CustomLayout_Changed_Root_Ok');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2, { unsafeSkipStorageCheck: true });
    t.deepEqual(comparison, []);
});
test('CustomLayout changed to default - ok', t => {
    const v1 = t.context.extractStorageLayout('CustomLayout');
    const v2 = t.context.extractStorageLayout('CustomLayout_Changed_To_Default_Ok');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.deepEqual(comparison, []);
});
test('CustomLayout changed to default - fallback - bad (no layout info)', t => {
    const v1 = t.context.extractStorageLayoutFallback('CustomLayout');
    const v2 = t.context.extractStorageLayoutFallback('CustomLayout_Changed_To_Default_Ok');
    const error = t.throws(() => (0, storage_1.getStorageUpgradeErrors)(v1, v2));
    t.snapshot(error?.message);
});
test('CustomLayout changed to default - fallback - unsafeSkipStorageCheck', t => {
    const v1 = t.context.extractStorageLayoutFallback('CustomLayout');
    const v2 = t.context.extractStorageLayoutFallback('CustomLayout_Changed_To_Default_Ok');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2, { unsafeSkipStorageCheck: true });
    t.deepEqual(comparison, []);
});
test('CustomLayout unsupported node type', t => {
    const error = t.throws(() => t.context.extractStorageLayout('CustomLayout_Unsupported_Node_Type'));
    t.snapshot(error?.message);
});
test('Namespaced - default to custom layout without regular variables - ok', t => {
    const v1 = t.context.extractStorageLayout('Namespaced_Default_Layout');
    const v2 = t.context.extractStorageLayout('Namespaced_Custom_Layout_Unaffected');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.deepEqual(comparison, []);
});
test('Namespaced - default to custom layout without regular variables - fallback - ok', t => {
    const v1 = t.context.extractStorageLayoutFallback('Namespaced_Default_Layout');
    const v2 = t.context.extractStorageLayoutFallback('Namespaced_Custom_Layout_Unaffected');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.deepEqual(comparison, []);
});
test('Namespaced - custom layout clash', t => {
    const error = t.throws(() => t.context.extractStorageLayout('Namespaced_Custom_Layout_Clash'));
    t.snapshot(error?.message);
});
test('Namespaced - custom layout clash decimal', t => {
    const error = t.throws(() => t.context.extractStorageLayout('Namespaced_Custom_Layout_Clash_Decimal'));
    t.snapshot(error?.message);
});
test('Namespaced - custom layout clash extra colon', t => {
    const error = t.throws(() => t.context.extractStorageLayout('Namespaced_Custom_Layout_Clash_Extra_Colon'));
    t.snapshot(error?.message);
});
test('CustomLayout no namespace formula - ok', t => {
    const layout = t.context.extractStorageLayout('CustomLayout_No_Namespace_Formula');
    t.snapshot((0, stabilize_layout_1.stabilizeStorageLayout)(layout));
});
test('CustomLayout unknown namespace formula - ok', t => {
    const layout = t.context.extractStorageLayout('CustomLayout_Unknown_Namespace_Formula');
    t.snapshot((0, stabilize_layout_1.stabilizeStorageLayout)(layout));
});
test('CustomLayout multiple namespaces', t => {
    const layout = t.context.extractStorageLayout('CustomLayout_Multiple_Namespaces');
    t.snapshot((0, stabilize_layout_1.stabilizeStorageLayout)(layout));
});
test('Gap - changed root - ok', t => {
    const v1 = t.context.extractStorageLayout('Gap');
    const v2 = t.context.extractStorageLayout('Gap_Changed_Root_Ok');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2);
    t.deepEqual(comparison, []);
});
test('Gap - changed root - fallback - bad (no layout info)', t => {
    const v1 = t.context.extractStorageLayoutFallback('Gap');
    const v2 = t.context.extractStorageLayoutFallback('Gap_Changed_Root_Ok');
    const error = t.throws(() => (0, storage_1.getStorageUpgradeErrors)(v1, v2));
    t.snapshot(error?.message);
});
test('Gap - changed root - fallback - unsafeSkipStorageCheck', t => {
    const v1 = t.context.extractStorageLayoutFallback('Gap');
    const v2 = t.context.extractStorageLayoutFallback('Gap_Changed_Root_Ok');
    const comparison = (0, storage_1.getStorageUpgradeErrors)(v1, v2, { unsafeSkipStorageCheck: true });
    t.deepEqual(comparison, []);
});
//# sourceMappingURL=storage-custom-layout.test.js.map