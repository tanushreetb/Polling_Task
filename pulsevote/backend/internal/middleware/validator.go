package middleware

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// ValidationErrorResponse formats validator errors into clean, informative messages
type ValidationErrorResponse struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// HandleValidationError inspects binding errors and returns a 400 Bad Request with field-level details
func HandleValidationError(c *gin.Context, err error) {
	var ve validator.ValidationErrors
	if errors.As(err, &ve) {
		out := make([]ValidationErrorResponse, len(ve))
		for i, fe := range ve {
			out[i] = ValidationErrorResponse{
				Field:   fe.Field(),
				Message: formatFieldMessage(fe),
			}
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"details": out,
		})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{
		"error": "Invalid request payload",
		"cause": err.Error(),
	})
}

func formatFieldMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "This field is required"
	case "email":
		return "Must be a valid email address"
	case "min":
		return fmt.Sprintf("Must be at least %s characters/items", fe.Param())
	case "max":
		return fmt.Sprintf("Must not exceed %s characters/items", fe.Param())
	default:
		return fmt.Sprintf("Failed validation on tag '%s'", fe.Tag())
	}
}
