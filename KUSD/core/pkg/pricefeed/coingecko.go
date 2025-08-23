package pricefeed

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/shopspring/decimal"
)

type CoingeckoService struct {
	baseURL string
	apiKey  string
	client  *http.Client
}

type CoingeckoPriceResponse struct {
	Prices map[string]map[string]float64 `json:",omitempty"`
}

func NewCoingeckoService(apiKey string) *CoingeckoService {
	return &CoingeckoService{
		baseURL: "https://api.coingecko.com/api/v3",
		apiKey:  apiKey,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// GetPrices fetches current prices for given symbols
func (c *CoingeckoService) GetPrices(symbols []string) (map[string]decimal.Decimal, error) {
	// Convert symbols to coingecko IDs
	coinIds := make([]string, 0, len(symbols))
	symbolToId := map[string]string{
		"BTC":  "bitcoin",
		"ETH":  "ethereum",
		"USDC": "usd-coin",
		"USDT": "tether",
		"DAI":  "dai",
		"WETH": "ethereum", // Same as ETH
		"WBTC": "bitcoin",  // Same as BTC
	}

	for _, symbol := range symbols {
		if id, exists := symbolToId[strings.ToUpper(symbol)]; exists {
			coinIds = append(coinIds, id)
		}
	}

	if len(coinIds) == 0 {
		return nil, fmt.Errorf("no valid coin IDs found for symbols: %v", symbols)
	}

	// Build request URL
	url := fmt.Sprintf("%s/simple/price?ids=%s&vs_currencies=usd",
		c.baseURL,
		strings.Join(coinIds, ","))

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Add API key if available
	if c.apiKey != "" {
		req.Header.Set("X-CG-Demo-API-Key", c.apiKey)
	}

	// Make request
	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch prices: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Parse response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	var priceData map[string]map[string]float64
	if err := json.Unmarshal(body, &priceData); err != nil {
		return nil, fmt.Errorf("failed to parse response: %v", err)
	}

	// Convert to result map
	result := make(map[string]decimal.Decimal)
	idToSymbol := make(map[string][]string)
	
	// Reverse mapping
	for symbol, id := range symbolToId {
		idToSymbol[id] = append(idToSymbol[id], symbol)
	}

	for coinId, prices := range priceData {
		if usdPrice, exists := prices["usd"]; exists {
			price := decimal.NewFromFloat(usdPrice)
			
			// Map back to all symbols using this coin ID
			if symbolsList, exists := idToSymbol[coinId]; exists {
				for _, symbol := range symbolsList {
					result[symbol] = price
				}
			}
		}
	}

	return result, nil
}

// GetPrice fetches price for a single symbol
func (c *CoingeckoService) GetPrice(symbol string) (decimal.Decimal, error) {
	prices, err := c.GetPrices([]string{symbol})
	if err != nil {
		return decimal.Zero, err
	}

	price, exists := prices[strings.ToUpper(symbol)]
	if !exists {
		return decimal.Zero, fmt.Errorf("price not found for symbol: %s", symbol)
	}

	return price, nil
}

// HealthCheck verifies the service is working
func (c *CoingeckoService) HealthCheck() error {
	url := fmt.Sprintf("%s/ping", c.baseURL)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create health check request: %v", err)
	}

	if c.apiKey != "" {
		req.Header.Set("X-CG-Demo-API-Key", c.apiKey)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("health check failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("health check returned status %d", resp.StatusCode)
	}

	return nil
}