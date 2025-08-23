package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"usdk-backend/internal/config"
	"usdk-backend/internal/handler"
	"usdk-backend/internal/repository"
	"usdk-backend/internal/service"
	"usdk-backend/pkg/database"
	"usdk-backend/pkg/middleware"
	"usdk-backend/pkg/riskcontrol"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	if err := database.InitDatabase(cfg); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate database tables (optional, only in development)
	// if err := database.AutoMigrate(); err != nil {
	// 	log.Fatal("Failed to migrate database:", err)
	// }

	// Initialize repositories
	db := database.GetDB()
	userRepo := repository.NewUserRepository(db)
	chainRepo := repository.NewChainRepository(db)
	assetRepo := repository.NewAssetRepository(db)
	chainAssetRepo := repository.NewChainAssetRepository(db)
	depositAddressRepo := repository.NewDepositAddressRepository(db)
	withdrawRequestRepo := repository.NewWithdrawRequestRepository(db)
	ledgerRepo := repository.NewLedgerRepository(db)
	platformMetricsRepo := repository.NewPlatformMetricsRepository(db)
	proofBatchRepo := repository.NewProofBatchRepository(db)
	riskConfigRepo := repository.NewRiskConfigRepository(db)
	blacklistRepo := repository.NewBlacklistRepository(db)

	// Initialize logger
	logger := logrus.New()
	logger.SetLevel(logrus.InfoLevel)

	// Initialize services
	riskService := riskcontrol.NewRiskService(userRepo, withdrawRequestRepo, ledgerRepo, riskConfigRepo, blacklistRepo, logger)
	metaService := service.NewMetaService(chainRepo, assetRepo, chainAssetRepo)
	userService := service.NewUserService(userRepo)
	walletService := service.NewWalletService(userRepo, chainRepo, assetRepo, depositAddressRepo, withdrawRequestRepo, riskService)
	portfolioService := service.NewPortfolioService(ledgerRepo, platformMetricsRepo, chainRepo, assetRepo)
	recordsService := service.NewRecordsService(ledgerRepo)
	proofsService := service.NewProofsService(proofBatchRepo)

	// Initialize handlers
	metaHandler := handler.NewMetaHandler(metaService)
	userHandler := handler.NewUserHandler(userService)
	nonceHandler := handler.NewNonceHandler(userService)
	walletHandler := handler.NewWalletHandler(walletService)
	portfolioHandler := handler.NewPortfolioHandler(portfolioService)
	recordsHandler := handler.NewRecordsHandler(recordsService)
	proofsHandler := handler.NewProofsHandler(proofsService)

	// Setup Gin
	gin.SetMode(cfg.Server.GinMode)
	r := gin.Default()

	// Middleware
	r.Use(middleware.CORSMiddleware())

	// API routes
	api := r.Group("/api/v1")

	// Public routes
	api.GET("/meta/supported", metaHandler.GetSupportedChains)
	api.GET("/auth/nonce", nonceHandler.GetNonce)
	api.POST("/user/login-siwe", userHandler.LoginSIWE)
	api.GET("/proofs/latest", proofsHandler.GetLatestProofs)

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.JWTAuthMiddleware())
	{
		// User routes
		protected.GET("/user/profile", userHandler.GetProfile)

		// Wallet routes
		protected.GET("/wallet/deposit-address", walletHandler.GetDepositAddress)
		protected.POST("/withdraw", walletHandler.Withdraw)

		// Portfolio routes
		protected.GET("/portfolio/overview", portfolioHandler.GetOverview)

		// Records routes
		protected.GET("/records", recordsHandler.GetRecords)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "healthy",
			"service": "usdk-backend",
		})
	})

	// Start server
	log.Printf("Server starting on port %s", cfg.Server.Port)
	if err := r.Run(":" + cfg.Server.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}