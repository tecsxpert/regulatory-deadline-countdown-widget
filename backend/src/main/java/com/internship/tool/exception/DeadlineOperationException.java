package com.internship.tool.exception;

public class DeadlineOperationException extends RuntimeException {

    public DeadlineOperationException(String message) {
        super(message);
    }

    public DeadlineOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
