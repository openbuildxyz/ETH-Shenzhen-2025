package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"usdk-backend/internal/service"
	"usdk-backend/pkg/utils"
)

type RecordsHandler struct {
	recordsService *service.RecordsService
}

func NewRecordsHandler(recordsService *service.RecordsService) *RecordsHandler {
	return &RecordsHandler{
		recordsService: recordsService,
	}
}

// GetRecords godoc
// @Summary Get user transaction records
// @Description Get paginated list of user's transaction and yield records
// @Tags Records
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param type query string false "Record type (deposit, withdraw, yield, trade)"
// @Param cursor query string false "Pagination cursor"
// @Param limit query int false "Number of records to return (default: 20, max: 100)"
// @Success 200 {object} utils.Response{data=service.RecordsResponse}
// @Failure 401 {object} utils.Response
// @Router /api/v1/records [get]
func (h *RecordsHandler) GetRecords(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("User not authenticated"))
		return
	}

	recordType := c.Query("type")
	cursor := c.Query("cursor")
	limitStr := c.DefaultQuery("limit", "20")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}

	records, err := h.recordsService.GetUserRecords(userID.(uint64), recordType, cursor, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse(err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(records))
}