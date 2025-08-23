package siwe

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/spruceid/siwe-go"
)

type SIWEService struct{}

func NewSIWEService() *SIWEService {
	return &SIWEService{}
}

// VerifyMessage verifies a SIWE message and signature
func (s *SIWEService) VerifyMessage(message, signature string) (*siwe.Message, error) {
	// Parse the SIWE message
	siweMessage, err := siwe.ParseMessage(message)
	if err != nil {
		return nil, fmt.Errorf("failed to parse SIWE message: %v", err)
	}

	// Validate the message timing
	now := time.Now()
	if siweMessage.NotBefore != nil && now.Before(*siweMessage.NotBefore) {
		return nil, errors.New("message not valid yet")
	}
	if siweMessage.ExpirationTime != nil && now.After(*siweMessage.ExpirationTime) {
		return nil, errors.New("message has expired")
	}

	// Verify the signature
	publicKey, err := siweMessage.VerifyEIP191(signature)
	if err != nil {
		return nil, fmt.Errorf("failed to verify signature: %v", err)
	}

	// Verify the address matches the recovered public key
	recoveredAddress := crypto.PubkeyToAddress(*publicKey)
	expectedAddress := common.HexToAddress(siweMessage.GetAddress())
	
	if !strings.EqualFold(recoveredAddress.Hex(), expectedAddress.Hex()) {
		return nil, errors.New("address mismatch between message and signature")
	}

	return siweMessage, nil
}

// GenerateNonce generates a random nonce for SIWE
func (s *SIWEService) GenerateNonce() string {
	return siwe.GenerateNonce()
}

// CreateMessage creates a SIWE message for signing
func (s *SIWEService) CreateMessage(domain, address, uri, nonce string) *siwe.Message {
	now := time.Now()
	expirationTime := now.Add(10 * time.Minute) // 10 minutes expiry

	message := &siwe.Message{
		Domain:         domain,
		Address:        address,
		Statement:      "Sign in to USDK Platform",
		URI:            uri,
		Version:        "1",
		ChainID:        1, // Ethereum mainnet, can be configurable
		Nonce:          nonce,
		IssuedAt:       now,
		ExpirationTime: &expirationTime,
	}

	return message
}

// ExtractAddressFromMessage extracts the Ethereum address from a SIWE message
func (s *SIWEService) ExtractAddressFromMessage(message string) (string, error) {
	siweMessage, err := siwe.ParseMessage(message)
	if err != nil {
		return "", fmt.Errorf("failed to parse SIWE message: %v", err)
	}

	return siweMessage.GetAddress(), nil
}