package edu.faculty.aseca.pay_and_pray_api.config

import edu.faculty.aseca.pay_and_pray_api.auth.exception.DuplicateEmailException
import edu.faculty.aseca.pay_and_pray_api.auth.exception.InvalidCredentialsException
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarApiException
import edu.faculty.aseca.pay_and_pray_api.portfolio.exception.InsufficientQuantityException
import edu.faculty.aseca.pay_and_pray_api.portfolio.exception.NoPositionException
import edu.faculty.aseca.pay_and_pray_api.portfolio.exception.TickerNotFoundException
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

    @ExceptionHandler(EdgarApiException::class)
    fun handleEdgarUnavailable(ex: EdgarApiException): ResponseEntity<ErrorResponse> =
        ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(ErrorResponse(error = ex.message ?: "EDGAR service unavailable. Please try again later."))

    @ExceptionHandler(TickerNotFoundException::class)
    fun handleTickerNotFound(ex: TickerNotFoundException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse(error = ex.message ?: "Not found"))

    @ExceptionHandler(NoPositionException::class)
    fun handleNoPosition(ex: NoPositionException): ResponseEntity<ErrorResponse> =
        ResponseEntity.badRequest().body(ErrorResponse(error = ex.message ?: "Bad request"))

    @ExceptionHandler(InsufficientQuantityException::class)
    fun handleInsufficientQuantity(ex: InsufficientQuantityException): ResponseEntity<ErrorResponse> =
        ResponseEntity.badRequest().body(ErrorResponse(error = ex.message ?: "Bad request"))
}

data class ErrorResponse(
    val error: String,
)

data class ValidationErrorResponse(
    val errors: Map<String, String>,
)
