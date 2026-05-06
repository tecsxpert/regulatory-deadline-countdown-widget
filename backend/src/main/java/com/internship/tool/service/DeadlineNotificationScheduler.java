package com.internship.tool.service;

import com.internship.tool.entity.DeadlineStatus;
import com.internship.tool.entity.RegulatoryDeadline;
import com.internship.tool.exception.EmailNotificationException;
import com.internship.tool.repository.RegulatoryDeadlineRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeadlineNotificationScheduler {

    private static final List<DeadlineStatus> NOTIFIABLE_STATUSES = List.of(
            DeadlineStatus.UPCOMING,
            DeadlineStatus.IN_PROGRESS
    );

    private final RegulatoryDeadlineRepository regulatoryDeadlineRepository;
    private final DeadlineEmailService deadlineEmailService;

    @Value("${app.notifications.deadline-alert-days:1}")
    private long deadlineAlertDays;

    @Scheduled(
            cron = "${app.notifications.daily-cron:0 0 9 * * *}",
            zone = "${app.notifications.time-zone:Asia/Calcutta}"
    )
    @Transactional(readOnly = true)
    public void sendDailyDeadlineNotifications() {
        LocalDate today = LocalDate.now();
        sendReminderNotifications(today);
        sendDeadlineAlerts(today);
    }

    private void sendReminderNotifications(LocalDate today) {
        List<RegulatoryDeadline> reminders = regulatoryDeadlineRepository.findByReminderDateAndStatusInAndActiveTrue(
                today,
                NOTIFIABLE_STATUSES
        );

        for (RegulatoryDeadline deadline : reminders) {
            try {
                deadlineEmailService.sendReminderEmail(deadline);
                log.info("Sent reminder email for deadline id {}", deadline.getId());
            } catch (EmailNotificationException exception) {
                log.error("Failed to send reminder email for deadline id {}", deadline.getId(), exception);
            }
        }
    }

    private void sendDeadlineAlerts(LocalDate today) {
        LocalDate alertUntil = today.plusDays(Math.max(deadlineAlertDays, 0));
        List<RegulatoryDeadline> dueSoonAlerts = regulatoryDeadlineRepository.findByDeadlineDateBetweenAndStatusInAndActiveTrue(
                today,
                alertUntil,
                NOTIFIABLE_STATUSES
        );
        List<RegulatoryDeadline> overdueAlerts = regulatoryDeadlineRepository.findByDeadlineDateBeforeAndStatusInAndActiveTrue(
                today,
                NOTIFIABLE_STATUSES
        );
        List<RegulatoryDeadline> alerts = mergeAlerts(overdueAlerts, dueSoonAlerts);

        for (RegulatoryDeadline deadline : alerts) {
            try {
                deadlineEmailService.sendDeadlineAlertEmail(deadline);
                log.info("Sent deadline alert email for deadline id {}", deadline.getId());
            } catch (EmailNotificationException exception) {
                log.error("Failed to send deadline alert email for deadline id {}", deadline.getId(), exception);
            }
        }
    }

    private List<RegulatoryDeadline> mergeAlerts(List<RegulatoryDeadline> overdueAlerts, List<RegulatoryDeadline> dueSoonAlerts) {
        Map<Long, RegulatoryDeadline> alertsById = new LinkedHashMap<>();
        List<RegulatoryDeadline> combinedAlerts = new ArrayList<>();
        combinedAlerts.addAll(overdueAlerts);
        combinedAlerts.addAll(dueSoonAlerts);

        for (RegulatoryDeadline deadline : combinedAlerts) {
            alertsById.put(deadline.getId(), deadline);
        }

        return new ArrayList<>(alertsById.values());
    }
}
