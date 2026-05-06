package com.internship.tool.service;

import com.internship.tool.entity.RegulatoryDeadline;
import com.internship.tool.exception.EmailNotificationException;
import com.internship.tool.exception.InvalidDeadlineDataException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class DeadlineEmailService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.notifications.from-email:noreply@tool87.local}")
    private String fromEmail;

    public void sendReminderEmail(RegulatoryDeadline deadline) {
        validateRecipient(deadline);
        Context context = baseContext(deadline);
        context.setVariable("subjectLine", "Regulatory deadline reminder");
        context.setVariable("headline", "Deadline reminder");
        context.setVariable("message", "This is your scheduled reminder for an upcoming regulatory deadline.");
        sendHtmlEmail(
                deadline.getOwnerEmail(),
                "Reminder: " + deadline.getTitle() + " due on " + formatDate(deadline.getDeadlineDate()),
                "deadline-reminder",
                context
        );
    }

    public void sendDeadlineAlertEmail(RegulatoryDeadline deadline) {
        validateRecipient(deadline);
        Context context = baseContext(deadline);
        context.setVariable("subjectLine", "Regulatory deadline alert");
        context.setVariable("headline", "Deadline alert");
        context.setVariable("message", buildAlertMessage(deadline.getDeadlineDate()));
        sendHtmlEmail(
                deadline.getOwnerEmail(),
                "Alert: " + deadline.getTitle() + " deadline is near",
                "deadline-alert",
                context
        );
    }

    private void validateRecipient(RegulatoryDeadline deadline) {
        if (deadline == null) {
            throw new InvalidDeadlineDataException("Deadline payload must not be null");
        }
        if (deadline.getOwnerEmail() == null || deadline.getOwnerEmail().isBlank()) {
            throw new InvalidDeadlineDataException("Owner email is required to send notifications");
        }
    }

    private Context baseContext(RegulatoryDeadline deadline) {
        Context context = new Context();
        context.setVariable("ownerName", deadline.getOwnerName());
        context.setVariable("title", deadline.getTitle());
        context.setVariable("regulatoryBody", deadline.getRegulatoryBody());
        context.setVariable("deadlineDate", formatDate(deadline.getDeadlineDate()));
        context.setVariable("reminderDate", formatDate(deadline.getReminderDate()));
        context.setVariable("status", deadline.getStatus().name());
        context.setVariable("priority", deadline.getPriority().name());
        context.setVariable("responsibleTeam", deadline.getResponsibleTeam());
        context.setVariable("description", deadline.getDescription());
        context.setVariable("referenceUrl", deadline.getReferenceUrl());
        return context;
    }

    private void sendHtmlEmail(String recipient, String subject, String templateName, Context context) {
        try {
            String htmlBody = templateEngine.process(templateName, context);
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            javaMailSender.send(mimeMessage);
        } catch (MessagingException exception) {
            throw new EmailNotificationException("Failed to prepare email for " + recipient, exception);
        } catch (RuntimeException exception) {
            throw new EmailNotificationException("Failed to send email to " + recipient, exception);
        }
    }

    private String buildAlertMessage(LocalDate deadlineDate) {
        if (deadlineDate == null) {
            return "A regulatory deadline needs your immediate attention.";
        }

        LocalDate today = LocalDate.now();
        if (deadlineDate.isBefore(today)) {
            return "This regulatory deadline is overdue and requires immediate action.";
        }
        if (deadlineDate.isEqual(today)) {
            return "This regulatory deadline is due today. Please review it immediately.";
        }
        return "This regulatory deadline is approaching soon. Please review the details and take action.";
    }

    private String formatDate(LocalDate date) {
        return date == null ? "Not set" : DATE_FORMATTER.format(date);
    }
}
