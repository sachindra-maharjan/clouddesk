package io.clouddesk.shared.web;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import io.clouddesk.auth.application.InvalidCredentialException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ApiError(String message, Instant timestamp) {
        public static ApiError of(String message) {
            return new ApiError(message, Instant.now());
        }
    }

    @ExceptionHandler(InvalidCredentialException.class)
    public ResponseEntity<ApiError> handleInvalidCredentialsException(InvalidCredentialException e) {
        ApiError error = ApiError.of(e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fieldError -> fieldError.getField() + " " + fieldError.getDefaultMessage())
                .orElse("Invalid request.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiError.of(message));
    }

}
