package riskcontrol

import (
	"fmt"
	"time"

	"github.com/shopspring/decimal"
	"github.com/sirupsen/logrus"

	"usdk-backend/internal/model"
	"usdk-backend/internal/repository"
)

type RiskService struct {
	userRepo           *repository.UserRepository
	withdrawRequestRepo *repository.WithdrawRequestRepository
	ledgerRepo         *repository.LedgerRepository
	riskConfigRepo     *repository.RiskConfigRepository
	blacklistRepo      *repository.BlacklistRepository
	logger             *logrus.Logger
}

func NewRiskService(
	userRepo *repository.UserRepository,
	withdrawRequestRepo *repository.WithdrawRequestRepository,
	ledgerRepo *repository.LedgerRepository,
	riskConfigRepo *repository.RiskConfigRepository,
	blacklistRepo *repository.BlacklistRepository,
	logger *logrus.Logger,
) *RiskService {
	return &RiskService{
		userRepo:           userRepo,
		withdrawRequestRepo: withdrawRequestRepo,
		ledgerRepo:         ledgerRepo,
		riskConfigRepo:     riskConfigRepo,
		blacklistRepo:      blacklistRepo,
		logger:             logger,
	}
}

type RiskCheckResult struct {
	Approved     bool     `json:"approved"`
	RiskScore    float64  `json:"riskScore"`
	Reasons      []string `json:"reasons"`
	RequiresKYC  bool     `json:"requiresKyc"`
	MaxAmount    decimal.Decimal `json:"maxAmount"`
	WaitingTime  int      `json:"waitingTimeHours"` // Hours to wait before approval
}

// CheckWithdrawRisk performs comprehensive risk checks for withdrawal requests
func (r *RiskService) CheckWithdrawRisk(userID uint64, amount decimal.Decimal, toAddress string, chainID uint64) (*RiskCheckResult, error) {
	result := &RiskCheckResult{
		Approved:    true,
		RiskScore:   0.0,
		Reasons:     make([]string, 0),
		RequiresKYC: false,
		MaxAmount:   decimal.Zero,
		WaitingTime: 0,
	}

	// Check if address is blacklisted
	if blacklisted, err := r.isAddressBlacklisted(toAddress, chainID); err != nil {
		return nil, fmt.Errorf("failed to check blacklist: %v", err)
	} else if blacklisted {
		result.Approved = false
		result.RiskScore += 100.0
		result.Reasons = append(result.Reasons, "Destination address is blacklisted")
		return result, nil
	}

	// Check daily withdrawal limits
	if err := r.checkDailyLimits(userID, amount, result); err != nil {
		return nil, fmt.Errorf("failed to check daily limits: %v", err)
	}

	// Check KYC requirements
	if err := r.checkKYCRequirements(userID, amount, result); err != nil {
		return nil, fmt.Errorf("failed to check KYC requirements: %v", err)
	}

	// Check suspicious patterns
	if err := r.checkSuspiciousPatterns(userID, amount, result); err != nil {
		return nil, fmt.Errorf("failed to check suspicious patterns: %v", err)
	}

	// Check velocity limits
	if err := r.checkVelocityLimits(userID, amount, result); err != nil {
		return nil, fmt.Errorf("failed to check velocity limits: %v", err)
	}

	// Determine final approval based on risk score
	if result.RiskScore >= 80.0 {
		result.Approved = false
	} else if result.RiskScore >= 50.0 {
		result.Approved = false
		result.WaitingTime = 24 // Require 24-hour hold
		result.Reasons = append(result.Reasons, "High risk score requires manual review")
	} else if result.RiskScore >= 30.0 {
		result.WaitingTime = 1 // 1-hour delay for moderate risk
	}

	r.logger.WithFields(logrus.Fields{
		"user_id":     userID,
		"amount":      amount.String(),
		"to_address":  toAddress,
		"risk_score":  result.RiskScore,
		"approved":    result.Approved,
		"reasons":     result.Reasons,
	}).Info("Withdrawal risk assessment completed")

	return result, nil
}

// CheckDepositRisk performs risk checks for deposits
func (r *RiskService) CheckDepositRisk(userID uint64, amount decimal.Decimal, fromAddress string, chainID uint64) (*RiskCheckResult, error) {
	result := &RiskCheckResult{
		Approved:  true,
		RiskScore: 0.0,
		Reasons:   make([]string, 0),
	}

	// Check if source address is blacklisted
	if blacklisted, err := r.isAddressBlacklisted(fromAddress, chainID); err != nil {
		return nil, fmt.Errorf("failed to check blacklist: %v", err)
	} else if blacklisted {
		result.Approved = false
		result.RiskScore += 100.0
		result.Reasons = append(result.Reasons, "Source address is blacklisted")
		return result, nil
	}

	// Check daily deposit limits
	if err := r.checkDailyDepositLimits(userID, amount, result); err != nil {
		return nil, fmt.Errorf("failed to check daily deposit limits: %v", err)
	}

	return result, nil
}

func (r *RiskService) isAddressBlacklisted(address string, chainID uint64) (bool, error) {
	blacklistAddr, err := r.blacklistRepo.FindByAddress(address, chainID)
	if err != nil {
		// If not found, it's not blacklisted
		return false, nil
	}
	
	return blacklistAddr != nil && blacklistAddr.IsActive, nil
}

func (r *RiskService) checkDailyLimits(userID uint64, amount decimal.Decimal, result *RiskCheckResult) error {
	// Get max daily withdrawal limit from config
	maxDailyLimit, err := r.getRiskConfigDecimal("max_daily_withdrawal", decimal.NewFromInt(50000))
	if err != nil {
		return err
	}

	// Get user's withdrawals in the last 24 hours
	since := time.Now().Add(-24 * time.Hour)
	dailyWithdrawn, err := r.getDailyWithdrawnAmount(userID, since)
	if err != nil {
		return err
	}

	totalWithToday := dailyWithdrawn.Add(amount)
	
	if totalWithToday.GreaterThan(maxDailyLimit) {
		result.Approved = false
		result.RiskScore += 50.0
		result.MaxAmount = maxDailyLimit.Sub(dailyWithdrawn)
		result.Reasons = append(result.Reasons, 
			fmt.Sprintf("Daily withdrawal limit exceeded. Limit: %s, Already withdrawn: %s", 
				maxDailyLimit.String(), dailyWithdrawn.String()))
	} else if totalWithToday.GreaterThan(maxDailyLimit.Mul(decimal.NewFromFloat(0.8))) {
		// Warning when approaching 80% of limit
		result.RiskScore += 20.0
		result.Reasons = append(result.Reasons, "Approaching daily withdrawal limit")
	}

	return nil
}

func (r *RiskService) checkKYCRequirements(userID uint64, amount decimal.Decimal, result *RiskCheckResult) error {
	kycLimit, err := r.getRiskConfigDecimal("kyc_withdrawal_limit", decimal.NewFromInt(1000))
	if err != nil {
		return err
	}

	if amount.GreaterThan(kycLimit) {
		// Check if user has completed KYC (this would need to be implemented)
		hasKYC := false // Placeholder - implement actual KYC check
		
		if !hasKYC {
			result.Approved = false
			result.RequiresKYC = true
			result.RiskScore += 70.0
			result.Reasons = append(result.Reasons, 
				fmt.Sprintf("KYC required for withdrawals over %s", kycLimit.String()))
		}
	}

	return nil
}

func (r *RiskService) checkSuspiciousPatterns(userID uint64, amount decimal.Decimal, result *RiskCheckResult) error {
	threshold, err := r.getRiskConfigDecimal("suspicious_pattern_threshold", decimal.NewFromInt(10000))
	if err != nil {
		return err
	}

	// Check for rapid consecutive withdrawals
	recentWithdrawals, err := r.getRecentWithdrawals(userID, time.Hour)
	if err != nil {
		return err
	}

	if len(recentWithdrawals) >= 3 {
		result.RiskScore += 30.0
		result.Reasons = append(result.Reasons, "Multiple withdrawals in short time period")
	}

	// Check for large amount relative to user's typical activity
	if amount.GreaterThan(threshold) {
		avgAmount, err := r.getUserAverageWithdrawal(userID)
		if err == nil && avgAmount.GreaterThan(decimal.Zero) {
			ratio := amount.Div(avgAmount)
			if ratio.GreaterThan(decimal.NewFromInt(10)) {
				result.RiskScore += 40.0
				result.Reasons = append(result.Reasons, "Withdrawal amount significantly higher than usual")
			}
		}
	}

	return nil
}

func (r *RiskService) checkVelocityLimits(userID uint64, amount decimal.Decimal, result *RiskCheckResult) error {
	// Check withdrawal velocity (frequency and amounts)
	weeklyLimit := decimal.NewFromInt(100000) // $100K per week
	weeklyWithdrawn, err := r.getWeeklyWithdrawnAmount(userID)
	if err != nil {
		return err
	}

	if weeklyWithdrawn.Add(amount).GreaterThan(weeklyLimit) {
		result.RiskScore += 35.0
		result.Reasons = append(result.Reasons, "Weekly withdrawal limit approached")
	}

	return nil
}

func (r *RiskService) checkDailyDepositLimits(userID uint64, amount decimal.Decimal, result *RiskCheckResult) error {
	maxDailyDeposit, err := r.getRiskConfigDecimal("max_daily_deposit", decimal.NewFromInt(100000))
	if err != nil {
		return err
	}

	since := time.Now().Add(-24 * time.Hour)
	dailyDeposited, err := r.getDailyDepositedAmount(userID, since)
	if err != nil {
		return err
	}

	if dailyDeposited.Add(amount).GreaterThan(maxDailyDeposit) {
		result.Approved = false
		result.RiskScore += 30.0
		result.Reasons = append(result.Reasons, "Daily deposit limit exceeded")
	}

	return nil
}

// Helper functions

func (r *RiskService) getRiskConfigDecimal(key string, defaultValue decimal.Decimal) (decimal.Decimal, error) {
	config, err := r.riskConfigRepo.FindByKey(key)
	if err != nil {
		return defaultValue, nil // Use default if not found
	}
	
	value, err := decimal.NewFromString(config.ConfigValue)
	if err != nil {
		return defaultValue, nil
	}
	
	return value, nil
}

func (r *RiskService) getDailyWithdrawnAmount(userID uint64, since time.Time) (decimal.Decimal, error) {
	// This would query completed withdrawals in the timeframe
	// For now, return zero - implement actual query logic
	return decimal.Zero, nil
}

func (r *RiskService) getDailyDepositedAmount(userID uint64, since time.Time) (decimal.Decimal, error) {
	// This would query completed deposits in the timeframe
	return decimal.Zero, nil
}

func (r *RiskService) getWeeklyWithdrawnAmount(userID uint64) (decimal.Decimal, error) {
	since := time.Now().Add(-7 * 24 * time.Hour)
	return r.getDailyWithdrawnAmount(userID, since)
}

func (r *RiskService) getRecentWithdrawals(userID uint64, duration time.Duration) ([]model.WithdrawRequest, error) {
	// Query recent withdrawal requests
	return []model.WithdrawRequest{}, nil
}

func (r *RiskService) getUserAverageWithdrawal(userID uint64) (decimal.Decimal, error) {
	// Calculate user's average withdrawal amount over last 30 days
	return decimal.NewFromInt(1000), nil // Placeholder
}