package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"usdk-backend/internal/service"
	"usdk-backend/pkg/utils"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

type SIWELoginRequest struct {
	Message   string `json:"message" binding:"required"`
	Signature string `json:"signature" binding:"required"`
}

type SIWELoginResponse struct {
	Token string                    `json:"token"`
	User  *service.UserInfoResponse `json:"user"`
}

// LoginSIWE godoc
// @Summary SIWE (Sign-In with Ethereum) login
// @Description Authenticate user using Ethereum wallet signature
// @Tags User
// @Accept json
// @Produce json
// @Param request body SIWELoginRequest true "SIWE login request"
// @Success 200 {object} utils.Response{data=SIWELoginResponse}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /api/v1/user/login-siwe [post]
func (h *UserHandler) LoginSIWE(c *gin.Context) {
	var req SIWELoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("Invalid request parameters"))
		return
	}

	token, user, err := h.userService.LoginWithSIWE(req.Message, req.Signature)
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse(err.Error()))
		return
	}

	response := SIWELoginResponse{
		Token: token,
		User:  user,
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(response))
}

// GetProfile godoc
// @Summary Get user profile
// @Description Get current user's profile information
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=service.UserInfoResponse}
// @Failure 401 {object} utils.Response
// @Router /api/v1/user/profile [get]
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("User not authenticated"))
		return
	}

	user, err := h.userService.GetUserByID(userID.(uint64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse(err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(user))
}