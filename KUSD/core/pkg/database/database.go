package database

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"usdk-backend/internal/config"
	"usdk-backend/internal/model"
)

var DB *gorm.DB

func InitDatabase(cfg *config.Config) error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.DBName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	// Get underlying sql.DB to configure connection pool
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %v", err)
	}

	// Configure connection pool
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Test connection
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %v", err)
	}

	log.Println("Database connected successfully")
	return nil
}

func AutoMigrate() error {
	return DB.AutoMigrate(
		&model.User{},
		&model.Chain{},
		&model.Asset{},
		&model.ChainAsset{},
		&model.DepositAddress{},
		&model.OnchainTx{},
		&model.Valuation{},
		&model.PlatformMetrics{},
		&model.PriceFeed{},
		&model.LedgerEntry{},
		&model.ProofBatch{},
		&model.WithdrawRequest{},
		&model.WithdrawalWhitelist{},
		&model.RiskConfig{},
		&model.BlacklistAddress{},
		&model.SystemConfig{},
		&model.AuditLog{},
	)
}

func GetDB() *gorm.DB {
	return DB
}