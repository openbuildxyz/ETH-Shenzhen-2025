package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"usdk-backend/internal/service"
	"usdk-backend/pkg/utils"
)

type WalletHandler struct {
	walletService *service.WalletService
}

func NewWalletHandler(walletService *service.WalletService) *WalletHandler {
	return &WalletHandler{
		walletService: walletService,
	}
}

// GetDepositAddress godoc
// @Summary Get user deposit address
// @Description Get user's dedicated deposit address for specific chain and asset
// @Tags Wallet
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param chain query string true "Chain key (e.g. ethereum, arbitrum)"
// @Param asset query string true "Asset symbol (e.g. USDC, ETH)"
// @Success 200 {object} utils.Response{data=service.DepositAddressResponse}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /api/v1/wallet/deposit-address [get]
func (h *WalletHandler) GetDepositAddress(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("User not authenticated"))
		return
	}

	chainKey := c.Query("chain")
	assetSymbol := c.Query("asset")

	if chainKey == "" || assetSymbol == "" {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Chain and asset parameters are required"))
		return
	}

	address, err := h.walletService.GetOrCreateDepositAddress(userID.(uint64), chainKey, assetSymbol)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse(err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(address))
}

type WithdrawRequest struct {
	Chain     string `json:"chain" binding:"required"`
	Asset     string `json:"asset" binding:"required"`
	Amount    string `json:"amount" binding:"required"`
	ToAddress string `json:"toAddress" binding:"required"`
}

// Withdraw godoc
// @Summary Submit withdrawal request
// @Description Submit a withdrawal request for review and processing
// @Tags Wallet
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body WithdrawRequest true "Withdrawal request"
// @Success 200 {object} utils.Response{data=service.WithdrawResponse}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /api/v1/withdraw [post]
func (h *WalletHandler) Withdraw(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("User not authenticated"))
		return
	}

	var req WithdrawRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request parameters"))
		return
	}

	response, err := h.walletService.SubmitWithdrawRequest(
		userID.(uint64),
		req.Chain,
		req.Asset,
		req.Amount,
		req.ToAddress,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse(err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(response))
}