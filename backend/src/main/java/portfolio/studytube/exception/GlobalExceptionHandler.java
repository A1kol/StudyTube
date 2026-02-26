package portfolio.studytube.exception;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    //User exceptions handling
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        return createResponse("INVALID_FIELDS_LENGTH", HttpStatus.BAD_REQUEST);
    }


    @ExceptionHandler(com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException.class)
    public ResponseEntity<Map<String, Object>> handleUnknownProperty(com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException ex) {
        return createResponse("UNKNOWN_FIELD_PRESENTED: " + ex.getPropertyName(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidTokenException(InvalidTokenException ex) {
        return createResponse(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<Map<String, Object>> handleServiceException(ServiceException ex) {
        return createResponse(ex.getErrorCode(), ex.getHttpStatus());
    }

    private ResponseEntity<Map<String, Object>> createResponse(String errorCode, HttpStatus status) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("error", errorCode);

        return new ResponseEntity<>(body, status);
    }
}