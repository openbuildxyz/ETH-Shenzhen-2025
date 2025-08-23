package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"usdk-backend/internal/service"
	"usdk-backend/pkg/utils"
)

type PortfolioHandler struct {
	portfolioService *service.PortfolioService
}

func NewPortfolioHandler(portfolioService *service.PortfolioService) *PortfolioHandler {
	return &PortfolioHandler{
		portfolioService: portfolioService,
	}
}

// GetOverview godoc
// @Summary Get portfolio overview
// @Description Get user's portfolio overview including total KUSD value, asset distribution and APY
// @Tags Portfolio
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=service.PortfolioOverviewResponse}
// @Failure 401 {object} utils.Response
// @Router /api/v1/portfolio/overview [get]
func (h *PortfolioHandler) GetOverview(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("User not authenticated"))
		return
	}

	overview, err := h.portfolioService.GetPortfolioOverview(userID.(uint64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse(err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(overview))
}