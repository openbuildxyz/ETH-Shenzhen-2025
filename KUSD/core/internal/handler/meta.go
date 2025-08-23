package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"usdk-backend/internal/service"
	"usdk-backend/pkg/utils"
)

type MetaHandler struct {
	metaService *service.MetaService
}

func NewMetaHandler(metaService *service.MetaService) *MetaHandler {
	return &MetaHandler{
		metaService: metaService,
	}
}

// GetSupportedChains godoc
// @Summary Get supported chains and assets
// @Description Returns list of supported blockchain networks and their supported assets
// @Tags Meta
// @Accept json
// @Produce json
// @Success 200 {object} utils.Response{data=[]service.ChainWithAssets}
// @Router /api/v1/meta/supported [get]
func (h *MetaHandler) GetSupportedChains(c *gin.Context) {
	chains, err := h.metaService.GetSupportedChains()
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse(err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(gin.H{
		"chains": chains,
	}))
}