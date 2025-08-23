package service

import (
	"github.com/shopspring/decimal"

	"usdk-backend/internal/repository"
)

type PortfolioService struct {
	ledgerRepo         *repository.LedgerRepository
	platformMetricsRepo *repository.PlatformMetricsRepository
	chainRepo          *repository.ChainRepository
	assetRepo          *repository.AssetRepository
}

func NewPortfolioService(
	ledgerRepo *repository.LedgerRepository,
	platformMetricsRepo *repository.PlatformMetricsRepository,
	chainRepo *repository.ChainRepository,
	assetRepo *repository.AssetRepository,
) *PortfolioService {
	return &PortfolioService{
		ledgerRepo:         ledgerRepo,
		platformMetricsRepo: platformMetricsRepo,
		chainRepo:          chainRepo,
		assetRepo:          assetRepo,
	}
}

type AssetBalance struct {
	Chain  string `json:"chain"`
	Asset  string `json:"asset"`
	Amount string `json:"amount"`
	Kusd   string `json:"kusd"`
}

type PortfolioOverviewResponse struct {
	TotalKusd string         `json:"totalKusd"`
	APY       float64        `json:"apy"`
	TvlKusd   string         `json:"tvlKusd"`
	ByAsset   []AssetBalance `json:"byAsset"`
}

func (s *PortfolioService) GetPortfolioOverview(userID uint64) (*PortfolioOverviewResponse, error) {
	// Calculate user's current KUSD balance from ledger entries
	totalKusd, err := s.ledgerRepo.GetUserKUSDBalance(userID)
	if err != nil {
		return nil, err
	}

	// Get platform metrics for APY and TVL
	metrics, err := s.platformMetricsRepo.GetLatest()
	if err != nil {
		return nil, err
	}

	// Get user's asset distribution
	// TODO: Implement proper asset balance calculation
	// This should aggregate user's deposits by chain and asset,
	// subtract withdrawals, and calculate current holdings
	byAsset := []AssetBalance{
		{
			Chain:  "ethereum",
			Asset:  "USDC",
			Amount: "1000.0",
			Kusd:   "1000.0",
		},
		{
			Chain:  "arbitrum",
			Asset:  "ETH",
			Amount: "2.5",
			Kusd:   totalKusd.Sub(decimal.NewFromInt(1000)).String(),
		},
	}

	var apy float64 = 0.19
	if metrics != nil && metrics.ActualApy != nil {
		actualApy, _ := metrics.ActualApy.Float64()
		apy = actualApy
	}

	var tvlKusd string = "0"
	if metrics != nil {
		tvlKusd = metrics.TvlKusd.String()
	}

	return &PortfolioOverviewResponse{
		TotalKusd: totalKusd.String(),
		APY:       apy,
		TvlKusd:   tvlKusd,
		ByAsset:   byAsset,
	}, nil
}