package wallet

import (
	"crypto/rand"
	"fmt"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/tyler-smith/go-bip32"
	"github.com/tyler-smith/go-bip39"
)

// HDWalletService manages hierarchical deterministic wallet operations
type HDWalletService struct {
	masterSeed []byte
	masterKey  *bip32.Key
}

// NewHDWalletService creates a new HD wallet service
func NewHDWalletService(mnemonic string) (*HDWalletService, error) {
	if mnemonic == "" {
		return nil, fmt.Errorf("mnemonic cannot be empty")
	}

	// Validate mnemonic
	if !bip39.IsMnemonicValid(mnemonic) {
		return nil, fmt.Errorf("invalid mnemonic")
	}

	// Generate seed from mnemonic
	seed := bip39.NewSeed(mnemonic, "") // No passphrase

	// Generate master key
	masterKey, err := bip32.NewMasterKey(seed)
	if err != nil {
		return nil, fmt.Errorf("failed to generate master key: %v", err)
	}

	return &HDWalletService{
		masterSeed: seed,
		masterKey:  masterKey,
	}, nil
}

// GenerateMnemonic generates a new 12-word mnemonic
func GenerateMnemonic() (string, error) {
	entropy, err := bip39.NewEntropy(128) // 128 bits = 12 words
	if err != nil {
		return "", fmt.Errorf("failed to generate entropy: %v", err)
	}

	mnemonic, err := bip39.NewMnemonic(entropy)
	if err != nil {
		return "", fmt.Errorf("failed to generate mnemonic: %v", err)
	}

	return mnemonic, nil
}

// DeriveAddress derives an Ethereum address at the given derivation path
func (h *HDWalletService) DeriveAddress(derivationPath string) (string, error) {
	key, err := h.deriveKey(derivationPath)
	if err != nil {
		return "", err
	}

	// Convert to ECDSA private key
	privateKey, err := crypto.ToECDSA(key.Key)
	if err != nil {
		return "", fmt.Errorf("failed to convert to ECDSA key: %v", err)
	}

	// Generate Ethereum address
	address := crypto.PubkeyToAddress(privateKey.PublicKey)
	return address.Hex(), nil
}

// DeriveAddressForUser derives an address for a specific user ID
func (h *HDWalletService) DeriveAddressForUser(userID uint64, chainKey, assetSymbol string) (string, string, error) {
	// Standard Ethereum derivation path: m/44'/60'/0'/0/{userID}
	// We can add chain and asset specific paths if needed
	derivationPath := fmt.Sprintf("m/44'/60'/0'/0/%d", userID)

	address, err := h.DeriveAddress(derivationPath)
	if err != nil {
		return "", "", fmt.Errorf("failed to derive address for user %d: %v", userID, err)
	}

	return address, derivationPath, nil
}

// DerivePrivateKey derives the private key at the given derivation path
// WARNING: This should be used carefully and private keys should be encrypted in storage
func (h *HDWalletService) DerivePrivateKey(derivationPath string) (string, error) {
	key, err := h.deriveKey(derivationPath)
	if err != nil {
		return "", err
	}

	// Convert to ECDSA private key
	privateKey, err := crypto.ToECDSA(key.Key)
	if err != nil {
		return "", fmt.Errorf("failed to convert to ECDSA key: %v", err)
	}

	// Return hex-encoded private key
	return fmt.Sprintf("0x%x", crypto.FromECDSA(privateKey)), nil
}

// GetPublicKey gets the public key for a derivation path
func (h *HDWalletService) GetPublicKey(derivationPath string) (string, error) {
	key, err := h.deriveKey(derivationPath)
	if err != nil {
		return "", err
	}

	publicKey := key.PublicKey()
	return fmt.Sprintf("0x%x", publicKey.Key), nil
}

// ValidateAddress validates an Ethereum address
func ValidateAddress(address string) bool {
	return common.IsHexAddress(address)
}

// deriveKey derives a key at the given derivation path
func (h *HDWalletService) deriveKey(derivationPath string) (*bip32.Key, error) {
	path, err := accounts.ParseDerivationPath(derivationPath)
	if err != nil {
		return nil, fmt.Errorf("invalid derivation path %s: %v", derivationPath, err)
	}

	key := h.masterKey
	for _, index := range path {
		childKey, err := key.NewChildKey(index)
		if err != nil {
			return nil, fmt.Errorf("failed to derive child key at index %d: %v", index, err)
		}
		key = childKey
	}

	return key, nil
}

// GenerateRandomAddress generates a completely random Ethereum address (not HD)
// This is useful for testing or when HD wallet is not desired
func GenerateRandomAddress() (string, string, error) {
	// Generate random private key
	privateKey, err := crypto.GenerateKey()
	if err != nil {
		return "", "", fmt.Errorf("failed to generate private key: %v", err)
	}

	// Get address
	address := crypto.PubkeyToAddress(privateKey.PublicKey)

	// Get private key hex
	privateKeyHex := fmt.Sprintf("0x%x", crypto.FromECDSA(privateKey))

	return address.Hex(), privateKeyHex, nil
}

// HDWalletInfo contains information about the HD wallet
type HDWalletInfo struct {
	MasterFingerprint string `json:"masterFingerprint"`
	ExtendedPublicKey string `json:"extendedPublicKey"`
}

// GetWalletInfo returns information about the HD wallet
func (h *HDWalletService) GetWalletInfo() HDWalletInfo {
	return HDWalletInfo{
		MasterFingerprint: fmt.Sprintf("%x", h.masterKey.PublicKey().Key[:4]),
		ExtendedPublicKey: h.masterKey.PublicKey().String(),
	}
}

// DerivationPathValidator validates BIP44 derivation paths
type DerivationPathValidator struct{}

// ValidateDerivationPath validates a BIP44 derivation path format
func (d *DerivationPathValidator) ValidateDerivationPath(path string) error {
	_, err := accounts.ParseDerivationPath(path)
	if err != nil {
		return fmt.Errorf("invalid derivation path: %v", err)
	}
	return nil
}

// GenerateStandardPath generates a standard BIP44 path for Ethereum
func (d *DerivationPathValidator) GenerateStandardPath(account, change, addressIndex uint32) string {
	// BIP44 path: m/44'/60'/account'/change/address_index
	// 60 = Ethereum coin type
	return fmt.Sprintf("m/44'/60'/%d'/%d/%d", account, change, addressIndex)
}