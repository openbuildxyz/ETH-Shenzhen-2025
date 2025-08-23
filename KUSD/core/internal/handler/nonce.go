package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"usdk-backend/internal/service"
	"usdk-backend/pkg/utils"
)

type NonceHandler struct {
	userService *service.UserService
}

func NewNonceHandler(userService *service.UserService) *NonceHandler {
	return &NonceHandler{
		userService: userService,
	}
}

type NonceResponse struct {
	Nonce string `json:"nonce"`
}

// GetNonce godoc
// @Summary Generate nonce for SIWE
// @Description Generate a random nonce for Sign-In with Ethereum
// @Tags Auth
// @Accept json
// @Produce json
// @Success 200 {object} utils.Response{data=NonceResponse}
// @Router /api/v1/auth/nonce [get]
func (h *NonceHandler) GetNonce(c *gin.Context) {
	nonce := h.userService.GenerateNonce()
	
	response := NonceResponse{
		Nonce: nonce,
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(response))
}