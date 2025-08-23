package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Database   DatabaseConfig
	Server     ServerConfig
	JWT        JWTConfig
	Redis      RedisConfig
	Blockchain BlockchainConfig
	Platform   PlatformConfig
	Log        LogConfig
	Wallet     WalletConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type ServerConfig struct {
	Port    string
	GinMode string
}

type JWTConfig struct {
	Secret      string
	ExpireHours int
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type BlockchainConfig struct {
	EthereumRPC string
	ArbitrumRPC string
	OptimismRPC string
	PolygonRPC  string
	
	Contracts map[string]ContractAddresses
}

type ContractAddresses struct {
	USDK          string
	ProofRegistry string
}

type PlatformConfig struct {
	TargetAPY              float64
	MinDepositKUSD         float64
	MaxDailyWithdrawal     float64
	WithdrawalFeeRate      float64
	ConfirmationBlocks     int
	ProofBatchIntervalSec  int
}

type LogConfig struct {
	Level string
}

type WalletConfig struct {
	HDMnemonic     string
	WalletType     string // "hd" or "random"
	EncryptionKey  string // for encrypting private keys
}

var AppConfig *Config

func LoadConfig() *Config {
	// Load .env file if exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	config := &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "3306"),
			User:     getEnv("DB_USER", "root"),
			Password: getEnv("DB_PASSWORD", "123456"),
			DBName:   getEnv("DB_NAME", "kusd"),
		},
		Server: ServerConfig{
			Port:    getEnv("SERVER_PORT", "8080"),
			GinMode: getEnv("GIN_MODE", "debug"),
		},
		JWT: JWTConfig{
			Secret:      getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
			ExpireHours: getEnvAsInt("JWT_EXPIRE_HOURS", 24),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},
		Blockchain: BlockchainConfig{
			EthereumRPC: getEnv("ETHEREUM_RPC_URL", ""),
			ArbitrumRPC: getEnv("ARBITRUM_RPC_URL", ""),
			OptimismRPC: getEnv("OPTIMISM_RPC_URL", ""),
			PolygonRPC:  getEnv("POLYGON_RPC_URL", ""),
			Contracts: map[string]ContractAddresses{
				"ethereum": {
					USDK:          getEnv("USDK_CONTRACT_ETHEREUM", ""),
					ProofRegistry: getEnv("PROOF_REGISTRY_ETHEREUM", ""),
				},
				"arbitrum": {
					USDK:          getEnv("USDK_CONTRACT_ARBITRUM", ""),
					ProofRegistry: getEnv("PROOF_REGISTRY_ARBITRUM", ""),
				},
				"optimism": {
					USDK:          getEnv("USDK_CONTRACT_OPTIMISM", ""),
					ProofRegistry: getEnv("PROOF_REGISTRY_OPTIMISM", ""),
				},
			},
		},
		Platform: PlatformConfig{
			TargetAPY:              getEnvAsFloat("TARGET_APY", 0.20),
			MinDepositKUSD:         getEnvAsFloat("MIN_DEPOSIT_KUSD", 10.0),
			MaxDailyWithdrawal:     getEnvAsFloat("MAX_DAILY_WITHDRAWAL", 50000.0),
			WithdrawalFeeRate:      getEnvAsFloat("WITHDRAWAL_FEE_RATE", 0.001),
			ConfirmationBlocks:     getEnvAsInt("CONFIRMATION_BLOCKS", 12),
			ProofBatchIntervalSec:  getEnvAsInt("PROOF_BATCH_INTERVAL", 86400),
		},
		Log: LogConfig{
			Level: getEnv("LOG_LEVEL", "info"),
		},
		Wallet: WalletConfig{
			HDMnemonic:    getEnv("HD_MNEMONIC", ""),
			WalletType:    getEnv("WALLET_TYPE", "hd"),
			EncryptionKey: getEnv("WALLET_ENCRYPTION_KEY", ""),
		},
	}

	AppConfig = config
	return config
}

func getEnv(key, defaultVal string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultVal
}

func getEnvAsInt(name string, defaultVal int) int {
	valueStr := getEnv(name, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultVal
}

func getEnvAsFloat(name string, defaultVal float64) float64 {
	valueStr := getEnv(name, "")
	if value, err := strconv.ParseFloat(valueStr, 64); err == nil {
		return value
	}
	return defaultVal
}

func getEnvAsBool(name string, defaultVal bool) bool {
	valueStr := getEnv(name, "")
	if value, err := strconv.ParseBool(valueStr); err == nil {
		return value
	}
	return defaultVal
}

func getEnvAsSlice(name string, defaultVal []string, sep string) []string {
	valueStr := getEnv(name, "")
	if valueStr == "" {
		return defaultVal
	}
	return strings.Split(valueStr, sep)
}