package portfolio.studytube.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ServiceException extends RuntimeException{
    private final String errorCode;
    private final HttpStatus httpStatus;

    public ServiceException(String errorCode, HttpStatus httpStatus) {
        super(errorCode);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }
}
