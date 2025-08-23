package service

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"

	"usdk-backend/internal/model"
	"usdk-backend/internal/repository"
	"usdk-backend/pkg/siwe"
	"usdk-backend/pkg/utils"
)

type UserService struct {
	userRepo    *repository.UserRepository
	siweService *siwe.SIWEService
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{
		userRepo:    userRepo,
		siweService: siwe.NewSIWEService(),
	}
}

type UserInfoResponse struct {
	ID         uint64  `json:"id"`
	WalletAddr *string `json:"walletAddr"`
	Email      *string `json:"email"`
}

func (s *UserService) LoginWithSIWE(message, signature string) (string, *UserInfoResponse, error) {
	// Verify SIWE message and signature
	siweMessage, err := s.siweService.VerifyMessage(message, signature)
	if err != nil {
		return "", nil, fmt.Errorf("SIWE verification failed: %v", err)
	}

	// Extract wallet address from verified message
	walletAddr := siweMessage.GetAddress()

	// Find or create user
	user, err := s.userRepo.FindByWalletAddr(walletAddr)
	if err != nil {
		// Create new user if not exists
		nonce := s.generateNonce()
		user = &model.User{
			WalletAddr: &walletAddr,
			Nonce:      &nonce,
		}
		
		if err := s.userRepo.Create(user); err != nil {
			return "", nil, fmt.Errorf("failed to create user: %v", err)
		}
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		return "", nil, fmt.Errorf("failed to generate token: %v", err)
	}

	userInfo := &UserInfoResponse{
		ID:         user.ID,
		WalletAddr: user.WalletAddr,
		Email:      user.Email,
	}

	return token, userInfo, nil
}

func (s *UserService) GetUserByID(userID uint64) (*UserInfoResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}

	return &UserInfoResponse{
		ID:         user.ID,
		WalletAddr: user.WalletAddr,
		Email:      user.Email,
	}, nil
}

func (s *UserService) GenerateNonce() string {
	return s.siweService.GenerateNonce()
}

func (s *UserService) generateNonce() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}