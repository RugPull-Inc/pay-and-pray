package edu.faculty.aseca.pay_and_pray_api.config

import edu.faculty.aseca.pay_and_pray_api.auth.exception.DuplicateEmailException
import edu.faculty.aseca.pay_and_pray_api.auth.exception.InvalidCredentialsException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ValidationErrorResponse> {
        val fieldErrors =
            ex.bindingResult.fieldErrors.associate { error ->
                error.field to (error.defaultMessage ?: "invalid value")
            }

        return ResponseEntity.badRequest().body(ValidationErrorResponse(errors = fieldErrors))
    }

    @ExceptionHandler(InvalidCredentialsException::class)
    fun handleInvalidCredentials(ex: InvalidCredentialsException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ErrorResponse(error = ex.message ?: "Unauthorized"))

    @ExceptionHandler(DuplicateEmailException::class)
    fun handleDuplicateEmail(ex: DuplicateEmailException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.CONFLICT).body(ErrorResponse(error = ex.message ?: "Conflict"))
}

data class ErrorResponse(
    val error: String,
)

data class ValidationErrorResponse(
    val errors: Map<String, String>,
)
