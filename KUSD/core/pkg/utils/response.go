package utils

import "time"

type Response struct {
	Success   bool        `json:"success"`
	Message   string      `json:"message,omitempty"`
	Data      interface{} `json:"data,omitempty"`
	Error     string      `json:"error,omitempty"`
	Timestamp int64       `json:"timestamp"`
}

type PaginatedResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data"`
	Total     int64       `json:"total"`
	Page      int         `json:"page"`
	PageSize  int         `json:"pageSize"`
	Timestamp int64       `json:"timestamp"`
}

func SuccessResponse(data interface{}) Response {
	return Response{
		Success:   true,
		Data:      data,
		Timestamp: time.Now().Unix(),
	}
}

func SuccessWithMessageResponse(message string, data interface{}) Response {
	return Response{
		Success:   true,
		Message:   message,
		Data:      data,
		Timestamp: time.Now().Unix(),
	}
}

func ErrorResponse(message string) Response {
	return Response{
		Success:   false,
		Error:     message,
		Timestamp: time.Now().Unix(),
	}
}

func PaginatedSuccessResponse(data interface{}, total int64, page, pageSize int) PaginatedResponse {
	return PaginatedResponse{
		Success:   true,
		Data:      data,
		Total:     total,
		Page:      page,
		PageSize:  pageSize,
		Timestamp: time.Now().Unix(),
	}
}