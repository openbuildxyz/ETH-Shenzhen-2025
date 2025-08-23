package pricefeed

import (
	"fmt"
	"sync"
	"time"

	"github.com/shopspring/decimal"
	"github.com/sirupsen/logrus"
)

type PriceFeedService struct {
	coingecko *CoingeckoService
	cache     map[string]CachedPrice
	cacheMux  sync.RWMutex
	logger    *logrus.Logger
}

type CachedPrice struct {
	Price     decimal.Decimal
	Timestamp time.Time
}

type PriceProvider interface {
	GetPrice(symbol string) (decimal.Decimal, error)
	GetPrices(symbols []string) (map[string]decimal.Decimal, error)
	HealthCheck() error
}

func NewPriceFeedService(coingeckoAPIKey string, logger *logrus.Logger) *PriceFeedService {
	return &PriceFeedService{
		coingecko: NewCoingeckoService(coingeckoAPIKey),
		cache:     make(map[string]CachedPrice),
		logger:    logger,
	}
}

// GetPrice gets the current price for a symbol with caching
func (p *PriceFeedService) GetPrice(symbol string) (decimal.Decimal, error) {
	// Check cache first
	p.cacheMux.RLock()
	if cached, exists := p.cache[symbol]; exists {
		// Cache valid for 1 minute
		if time.Since(cached.Timestamp) < time.Minute {
			p.cacheMux.RUnlock()
			return cached.Price, nil
		}
	}
	p.cacheMux.RUnlock()

	// Fetch fresh price
	price, err := p.coingecko.GetPrice(symbol)
	if err != nil {
		p.logger.WithError(err).WithField("symbol", symbol).Error("Failed to fetch price")
		return decimal.Zero, fmt.Errorf("failed to get price for %s: %v", symbol, err)
	}

	// Update cache
	p.cacheMux.Lock()
	p.cache[symbol] = CachedPrice{
		Price:     price,
		Timestamp: time.Now(),
	}
	p.cacheMux.Unlock()

	p.logger.WithFields(logrus.Fields{
		"symbol": symbol,
		"price":  price.String(),
	}).Debug("Price fetched successfully")

	return price, nil
}

// GetPrices gets prices for multiple symbols
func (p *PriceFeedService) GetPrices(symbols []string) (map[string]decimal.Decimal, error) {
	var uncachedSymbols []string
	result := make(map[string]decimal.Decimal)

	// Check cache for each symbol
	p.cacheMux.RLock()
	for _, symbol := range symbols {
		if cached, exists := p.cache[symbol]; exists && time.Since(cached.Timestamp) < time.Minute {
			result[symbol] = cached.Price
		} else {
			uncachedSymbols = append(uncachedSymbols, symbol)
		}
	}
	p.cacheMux.RUnlock()

	// Fetch uncached prices
	if len(uncachedSymbols) > 0 {
		freshPrices, err := p.coingecko.GetPrices(uncachedSymbols)
		if err != nil {
			p.logger.WithError(err).WithField("symbols", uncachedSymbols).Error("Failed to fetch prices")
			return nil, fmt.Errorf("failed to get prices: %v", err)
		}

		// Update cache and result
		p.cacheMux.Lock()
		now := time.Now()
		for symbol, price := range freshPrices {
			p.cache[symbol] = CachedPrice{
				Price:     price,
				Timestamp: now,
			}
			result[symbol] = price
		}
		p.cacheMux.Unlock()

		p.logger.WithField("count", len(freshPrices)).Debug("Bulk prices fetched successfully")
	}

	return result, nil
}

// GetUSDValue converts an amount of a given asset to USD value
func (p *PriceFeedService) GetUSDValue(symbol string, amount decimal.Decimal) (decimal.Decimal, error) {
	// Stablecoins are assumed to be $1
	if isStablecoin(symbol) {
		return amount, nil
	}

	price, err := p.GetPrice(symbol)
	if err != nil {
		return decimal.Zero, err
	}

	return amount.Mul(price), nil
}

// HealthCheck verifies all price providers are working
func (p *PriceFeedService) HealthCheck() error {
	if err := p.coingecko.HealthCheck(); err != nil {
		return fmt.Errorf("coingecko health check failed: %v", err)
	}
	return nil
}

// ClearCache clears the price cache
func (p *PriceFeedService) ClearCache() {
	p.cacheMux.Lock()
	defer p.cacheMux.Unlock()
	
	p.cache = make(map[string]CachedPrice)
	p.logger.Info("Price cache cleared")
}

// GetCacheSize returns the number of cached prices
func (p *PriceFeedService) GetCacheSize() int {
	p.cacheMux.RLock()
	defer p.cacheMux.RUnlock()
	
	return len(p.cache)
}

// isStablecoin checks if a symbol represents a stablecoin
func isStablecoin(symbol string) bool {
	stablecoins := map[string]bool{
		"USDC": true,
		"USDT": true,
		"DAI":  true,
		"KUSD": true, // Our own stablecoin
	}
	return stablecoins[symbol]
}