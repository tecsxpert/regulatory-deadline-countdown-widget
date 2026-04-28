package com.internship.tool.config;

import com.internship.tool.entity.AppUser;
import com.internship.tool.entity.DeadlinePriority;
import com.internship.tool.entity.DeadlineStatus;
import com.internship.tool.entity.RegulatoryDeadline;
import com.internship.tool.entity.UserRole;
import com.internship.tool.repository.AppUserRepository;
import com.internship.tool.repository.RegulatoryDeadlineRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeederConfig {

    private static final int TARGET_DEADLINE_RECORDS = 30;

    private final RegulatoryDeadlineRepository regulatoryDeadlineRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedApplicationData() {
        return args -> {
            seedUsers();
            seedDeadlines();
        };
    }

    private void seedUsers() {
        createUserIfMissing("Admin User", "admin@tool87.com", "Password@123", UserRole.ADMIN);
        createUserIfMissing("Manager User", "manager@tool87.com", "Password@123", UserRole.MANAGER);
        createUserIfMissing("Viewer User", "user@tool87.com", "Password@123", UserRole.USER);
    }

    private void createUserIfMissing(String name, String email, String password, UserRole role) {
        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            return;
        }

        appUserRepository.save(AppUser.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .enabled(Boolean.TRUE)
                .build());
    }

    private void seedDeadlines() {
        if (regulatoryDeadlineRepository.count() >= TARGET_DEADLINE_RECORDS) {
            return;
        }

        List<RegulatoryDeadline> deadlines = new ArrayList<>();
        String[] regulatoryBodies = {"RBI", "SEBI", "IRDAI", "MCA", "GST Council", "DPDP Authority"};
        String[] jurisdictions = {"India", "Karnataka", "Maharashtra", "Delhi"};
        String[] categories = {"Compliance", "Audit", "Tax", "Data Privacy", "Reporting", "Governance"};
        String[] teams = {"Compliance", "Legal", "Finance", "Security", "Operations"};
        String[] owners = {"Bindu", "Asha", "Rahul", "Sneha", "Arjun", "Meera"};
        DeadlineStatus[] statuses = {
                DeadlineStatus.UPCOMING,
                DeadlineStatus.IN_PROGRESS,
                DeadlineStatus.COMPLETED
        };
        DeadlinePriority[] priorities = {
                DeadlinePriority.HIGH,
                DeadlinePriority.MEDIUM,
                DeadlinePriority.LOW
        };

        for (int index = 1; index <= TARGET_DEADLINE_RECORDS; index++) {
            DeadlineStatus status = statuses[(index - 1) % statuses.length];
            DeadlinePriority priority = priorities[(index - 1) % priorities.length];
            LocalDate deadlineDate = LocalDate.now().plusDays(index + 2L);

            deadlines.add(RegulatoryDeadline.builder()
                    .title("Regulatory Filing " + index)
                    .regulatoryBody(regulatoryBodies[(index - 1) % regulatoryBodies.length])
                    .jurisdiction(jurisdictions[(index - 1) % jurisdictions.length])
                    .category(categories[(index - 1) % categories.length])
                    .description("Prepare and submit regulatory deliverable number " + index + " with supporting documentation.")
                    .deadlineDate(deadlineDate)
                    .reminderDate(deadlineDate.minusDays(3))
                    .status(status)
                    .priority(priority)
                    .responsibleTeam(teams[(index - 1) % teams.length] + " Team")
                    .ownerName(owners[(index - 1) % owners.length])
                    .ownerEmail("owner" + index + "@tool87.com")
                    .referenceUrl("https://example.com/regulatory-filing-" + index)
                    .aiDescription("AI summary for regulatory filing " + index)
                    .aiRecommendations("Review checklist and notify stakeholders for filing " + index)
                    .riskScore(35 + (index % 60))
                    .active(Boolean.TRUE)
                    .build());
        }

        regulatoryDeadlineRepository.saveAll(deadlines);
    }
}
