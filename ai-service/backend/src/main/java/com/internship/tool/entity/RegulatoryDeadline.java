package com.internship.tool.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "regulatory_deadlines")
@EntityListeners(AuditingEntityListener.class)
public class RegulatoryDeadline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must not exceed 150 characters")
    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @NotBlank(message = "Regulatory body is required")
    @Size(max = 120, message = "Regulatory body must not exceed 120 characters")
    @Column(name = "regulatory_body", nullable = false, length = 120)
    private String regulatoryBody;

    @NotBlank(message = "Jurisdiction is required")
    @Size(max = 100, message = "Jurisdiction must not exceed 100 characters")
    @Column(name = "jurisdiction", nullable = false, length = 100)
    private String jurisdiction;

    @NotBlank(message = "Category is required")
    @Size(max = 80, message = "Category must not exceed 80 characters")
    @Column(name = "category", nullable = false, length = 80)
    private String category;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    @NotNull(message = "Deadline date is required")
    @Column(name = "deadline_date", nullable = false)
    private LocalDate deadlineDate;

    @Column(name = "reminder_date")
    private LocalDate reminderDate;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private DeadlineStatus status;

    @NotNull(message = "Priority is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private DeadlinePriority priority;

    @NotBlank(message = "Responsible team is required")
    @Size(max = 100, message = "Responsible team must not exceed 100 characters")
    @Column(name = "responsible_team", nullable = false, length = 100)
    private String responsibleTeam;

    @NotBlank(message = "Owner name is required")
    @Size(max = 100, message = "Owner name must not exceed 100 characters")
    @Column(name = "owner_name", nullable = false, length = 100)
    private String ownerName;

    @NotBlank(message = "Owner email is required")
    @Email(message = "Owner email must be valid")
    @Size(max = 150, message = "Owner email must not exceed 150 characters")
    @Column(name = "owner_email", nullable = false, length = 150)
    private String ownerEmail;

    @Size(max = 500, message = "Reference URL must not exceed 500 characters")
    @Column(name = "reference_url", length = 500)
    private String referenceUrl;

    @Size(max = 4000, message = "AI description must not exceed 4000 characters")
    @Column(name = "ai_description", length = 4000)
    private String aiDescription;

    @Size(max = 4000, message = "AI recommendations must not exceed 4000 characters")
    @Column(name = "ai_recommendations", length = 4000)
    private String aiRecommendations;

    @Min(value = 0, message = "Risk score must be at least 0")
    @Max(value = 100, message = "Risk score must not exceed 100")
    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = Boolean.TRUE;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
