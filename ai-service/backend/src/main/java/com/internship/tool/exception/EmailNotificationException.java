package com.internship.tool.exception;

public class EmailNotificationException extends DeadlineOperationException {

    public EmailNotificationException(String message) {
        super(message);
    }

    public EmailNotificationException(String message, Throwable cause) {
        super(message, cause);
    }
}
