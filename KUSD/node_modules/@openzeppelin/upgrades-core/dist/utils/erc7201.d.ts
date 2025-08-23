export declare const ERC7201_FORMULA_PREFIX = "erc7201:";
/**
 * Returns the ERC-7201 storage location hash for a given namespace id using formula:
 * keccak256(abi.encode(uint256(keccak256(bytes(id))) - 1)) & ~bytes32(uint256(0xff))
 *
 * @param id The namespace id, not including the 'erc7201:' prefix
 * @returns The ERC-7201 storage location hash as a hex string
 */
export declare function calculateERC7201StorageLocation(id: string): string;
//# sourceMappingURL=erc7201.d.ts.map