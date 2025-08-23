package service

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"

	"github.com/shopspring/decimal"

	"usdk-backend/internal/config"
	"usdk-backend/internal/model"
	"usdk-backend/internal/repository"
	"usdk-backend/pkg/riskcontrol"
	"usdk-backend/pkg/wallet"
)

type WalletService struct {
	userRepo           *repository.UserRepository
	chainRepo          *repository.ChainRepository
	assetRepo          *repository.AssetRepository
	depositAddressRepo *repository.DepositAddressRepository
	withdrawRequestRepo *repository.WithdrawRequestRepository
	hdWallet           *wallet.HDWalletService
	riskService        *riskcontrol.RiskService
}

func NewWalletService(
	userRepo *repository.UserRepository,
	chainRepo *repository.ChainRepository,
	assetRepo *repository.AssetRepository,
	depositAddressRepo *repository.DepositAddressRepository,
	withdrawRequestRepo *repository.WithdrawRequestRepository,
	riskService *riskcontrol.RiskService,
) *WalletService {
	// Initialize HD wallet if mnemonic is provided
	var hdWallet *wallet.HDWalletService
	if config.AppConfig.Wallet.HDMnemonic != "" && config.AppConfig.Wallet.WalletType == "hd" {
		var err error
		hdWallet, err = wallet.NewHDWalletService(config.AppConfig.Wallet.HDMnemonic)
		if err != nil {
			// Log error but don't fail initialization
			fmt.Printf("Warning: Failed to initialize HD wallet: %v\n", err)
		}
	}

	return &WalletService{
		userRepo:           userRepo,
		chainRepo:          chainRepo,
		assetRepo:          assetRepo,
		depositAddressRepo: depositAddressRepo,
		withdrawRequestRepo: withdrawRequestRepo,
		hdWallet:           hdWallet,
		riskService:        riskService,
	}
}

type DepositAddressResponse struct {
	Chain     string  `json:"chain"`
	Asset     string  `json:"asset"`
	Address   string  `json:"address"`
	Memo      *string `json:"memo"`
	MinAmount string  `json:"minAmount"`
	Fresh     bool    `json:"fresh"`
}

type WithdrawResponse struct {
	ID          uint64                          `json:"id"`
	Status      string                          `json:"status"`
	RiskCheck   *riskcontrol.RiskCheckResult    `json:"riskCheck,omitempty"`
	WaitingTime int                             `json:"waitingTimeHours,omitempty"`
}

func (s *WalletService) GetOrCreateDepositAddress(userID uint64, chainKey, assetSymbol string) (*DepositAddressResponse, error) {
	// Get chain and asset info
	chain, err := s.chainRepo.FindByChainKey(chainKey)
	if err != nil {
		return nil, fmt.Errorf("chain not found: %v", err)
	}

	asset, err := s.assetRepo.FindBySymbol(assetSymbol)
	if err != nil {
		return nil, fmt.Errorf("asset not found: %v", err)
	}

	// Check if deposit address already exists
	depositAddr, err := s.depositAddressRepo.FindByUserChainAsset(userID, chain.ID, asset.ID)
	if err == nil && depositAddr != nil {
		return &DepositAddressResponse{
			Chain:     chainKey,
			Asset:     assetSymbol,
			Address:   depositAddr.Address,
			Memo:      nil,
			MinAmount: asset.MinDeposit.String(),
			Fresh:     false,
		}, nil
	}

	// Create new deposit address
	address, derivationPath, err := s.generateDepositAddress(userID, chainKey, assetSymbol)
	if err != nil {
		return nil, fmt.Errorf("failed to generate deposit address: %v", err)
	}

	newDepositAddr := &model.DepositAddress{
		UserID:         userID,
		ChainID:        chain.ID,
		AssetID:        asset.ID,
		Address:        address,
		DerivationPath: &derivationPath,
		IsActive:       true,
	}

	if err := s.depositAddressRepo.Create(newDepositAddr); err != nil {
		return nil, fmt.Errorf("failed to create deposit address: %v", err)
	}

	return &DepositAddressResponse{
		Chain:     chainKey,
		Asset:     assetSymbol,
		Address:   address,
		Memo:      nil,
		MinAmount: asset.MinDeposit.String(),
		Fresh:     true,
	}, nil
}

func (s *WalletService) SubmitWithdrawRequest(userID uint64, chainKey, assetSymbol, amountStr, toAddress string) (*WithdrawResponse, error) {
	// Get chain and asset info
	chain, err := s.chainRepo.FindByChainKey(chainKey)
	if err != nil {
		return nil, fmt.Errorf("chain not found: %v", err)
	}

	asset, err := s.assetRepo.FindBySymbol(assetSymbol)
	if err != nil {
		return nil, fmt.Errorf("asset not found: %v", err)
	}

	// Parse amount
	amount, err := decimal.NewFromString(amountStr)
	if err != nil {
		return nil, fmt.Errorf("invalid amount format: %v", err)
	}

	if amount.LessThanOrEqual(decimal.Zero) {
		return nil, fmt.Errorf("amount must be greater than zero")
	}

	// Perform risk assessment
	riskResult, err := s.riskService.CheckWithdrawRisk(userID, amount, toAddress, chain.ID)
	if err != nil {
		return nil, fmt.Errorf("risk assessment failed: %v", err)
	}

	// Check if withdrawal is approved by risk system
	if !riskResult.Approved {
		return &WithdrawResponse{
			ID:        0, // No request created
			Status:    "rejected",
			RiskCheck: riskResult,
		}, nil
	}

	// Determine initial status based on risk score and waiting time
	initialStatus := "pending"
	if riskResult.WaitingTime > 0 {
		initialStatus = "pending_review"
	}

	// Create withdrawal request
	withdrawReq := &model.WithdrawRequest{
		UserID:    userID,
		ChainID:   chain.ID,
		AssetID:   asset.ID,
		Amount:    amount,
		ToAddress: toAddress,
		Status:    initialStatus,
		RiskScore: &riskResult.RiskScore,
	}

	if err := s.withdrawRequestRepo.Create(withdrawReq); err != nil {
		return nil, fmt.Errorf("failed to create withdrawal request: %v", err)
	}

	return &WithdrawResponse{
		ID:          withdrawReq.ID,
		Status:      withdrawReq.Status,
		RiskCheck:   riskResult,
		WaitingTime: riskResult.WaitingTime,
	}, nil
}

func (s *WalletService) generateDepositAddress(userID uint64, chainKey, assetSymbol string) (string, string, error) {
	if s.hdWallet != nil {
		// Use HD wallet to generate address
		address, derivationPath, err := s.hdWallet.DeriveAddressForUser(userID, chainKey, assetSymbol)
		if err != nil {
			return "", "", fmt.Errorf("HD wallet address generation failed: %v", err)
		}
		return address, derivationPath, nil
	}

	// Fallback to random address generation
	address, _, err := wallet.GenerateRandomAddress()
	if err != nil {
		return "", "", fmt.Errorf("random address generation failed: %v", err)
	}

	// For random addresses, use a pseudo derivation path for consistency
	derivationPath := fmt.Sprintf("random/user/%d/%s/%s", userID, chainKey, assetSymbol)
	return address, derivationPath, nil
}