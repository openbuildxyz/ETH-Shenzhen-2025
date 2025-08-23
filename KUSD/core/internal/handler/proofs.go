package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"usdk-backend/internal/service"
	"usdk-backend/pkg/utils"
)

type ProofsHandler struct {
	proofsService *service.ProofsService
}

func NewProofsHandler(proofsService *service.ProofsService) *ProofsHandler {
	return &ProofsHandler{
		proofsService: proofsService,
	}
}

// GetLatestProofs godoc
// @Summary Get latest proof batches
// @Description Get latest published proof batches for yields and trades
// @Tags Proofs
// @Accept json
// @Produce json
// @Success 200 {object} utils.Response{data=service.ProofsResponse}
// @Router /api/v1/proofs/latest [get]
func (h *ProofsHandler) GetLatestProofs(c *gin.Context) {
	proofs, err := h.proofsService.GetLatestProofs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse(err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(gin.H{
		"batches": proofs,
	}))
}