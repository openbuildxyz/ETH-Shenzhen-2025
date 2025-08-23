// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title USDK - Multi-chain Privacy Stablecoin
 * @dev ERC20 token with minting, burning, and pause functionality
 * Features:
 * - Multi-signature access control
 * - Pausable for emergency stops
 * - Permit functionality for gasless transactions
 * - Blacklist functionality for compliance
 */
contract USDK is ERC20, ERC20Permit, ERC20Pausable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BLACKLISTER_ROLE = keccak256("BLACKLISTER_ROLE");

    // Blacklist mapping
    mapping(address => bool) private _blacklisted;

    // Events
    event Blacklisted(address indexed account);
    event UnBlacklisted(address indexed account);

    constructor(
        string memory name,
        string memory symbol,
        address defaultAdmin,
        address minter,
        address burner,
        address pauser
    ) ERC20(name, symbol) ERC20Permit(name) {
        // Grant default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        
        // Grant roles to specified addresses
        if (minter != address(0)) {
            _grantRole(MINTER_ROLE, minter);
        }
        if (burner != address(0)) {
            _grantRole(BURNER_ROLE, burner);
        }
        if (pauser != address(0)) {
            _grantRole(PAUSER_ROLE, pauser);
        }
        
        // Grant blacklister role to admin
        _grantRole(BLACKLISTER_ROLE, defaultAdmin);
    }

    /**
     * @dev Mint tokens to specified address
     * Only accounts with MINTER_ROLE can call this
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(!_blacklisted[to], "USDK: recipient is blacklisted");
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from specified address
     * Only accounts with BURNER_ROLE can call this
     */
    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }

    /**
     * @dev Burn tokens from caller's account
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Pause all token transfers
     * Only accounts with PAUSER_ROLE can call this
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause all token transfers
     * Only accounts with PAUSER_ROLE can call this
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Add address to blacklist
     * Only accounts with BLACKLISTER_ROLE can call this
     */
    function blacklist(address account) external onlyRole(BLACKLISTER_ROLE) {
        require(account != address(0), "USDK: cannot blacklist zero address");
        require(!_blacklisted[account], "USDK: account is already blacklisted");
        
        _blacklisted[account] = true;
        emit Blacklisted(account);
    }

    /**
     * @dev Remove address from blacklist
     * Only accounts with BLACKLISTER_ROLE can call this
     */
    function unBlacklist(address account) external onlyRole(BLACKLISTER_ROLE) {
        require(_blacklisted[account], "USDK: account is not blacklisted");
        
        _blacklisted[account] = false;
        emit UnBlacklisted(account);
    }

    /**
     * @dev Check if address is blacklisted
     */
    function isBlacklisted(address account) external view returns (bool) {
        return _blacklisted[account];
    }

    /**
     * @dev Override transfer to check blacklist
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20, ERC20Pausable) {
        require(!_blacklisted[from], "USDK: sender is blacklisted");
        require(!_blacklisted[to], "USDK: recipient is blacklisted");
        
        super._update(from, to, value);
    }

    /**
     * @dev Emergency function to destroy blacklisted funds
     * Only accounts with BLACKLISTER_ROLE can call this
     */
    function destroyBlacklistedFunds(address account) external onlyRole(BLACKLISTER_ROLE) {
        require(_blacklisted[account], "USDK: account is not blacklisted");
        
        uint256 balance = balanceOf(account);
        if (balance > 0) {
            _burn(account, balance);
        }
    }

    /**
     * @dev Batch mint function for efficiency
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyRole(MINTER_ROLE) {
        require(recipients.length == amounts.length, "USDK: arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(!_blacklisted[recipients[i]], "USDK: recipient is blacklisted");
            _mint(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Get the current total supply
     */
    function getTotalSupply() external view returns (uint256) {
        return totalSupply();
    }
}