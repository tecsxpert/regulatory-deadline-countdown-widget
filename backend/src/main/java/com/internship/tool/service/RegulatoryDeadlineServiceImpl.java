package com.internship.tool.service;

import com.internship.tool.entity.DeadlineStatus;
import com.internship.tool.entity.RegulatoryDeadline;
import com.internship.tool.exception.DeadlineOperationException;
import com.internship.tool.exception.DuplicateDeadlineException;
import com.internship.tool.exception.InvalidDeadlineDataException;
import com.internship.tool.exception.ResourceNotFoundException;
import com.internship.tool.repository.RegulatoryDeadlineRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class RegulatoryDeadlineServiceImpl implements RegulatoryDeadlineService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "deadlineDate",
            "title",
            "regulatoryBody",
            "priority",
            "status",
            "createdAt"
    );

    private static final List<DeadlineStatus> OVERDUE_TRACKABLE_STATUSES = List.of(
            DeadlineStatus.UPCOMING,
            DeadlineStatus.IN_PROGRESS
    );

    private final RegulatoryDeadlineRepository regulatoryDeadlineRepository;
    private final Validator validator;

    @Override
    @CacheEvict(value = {"deadlineById", "deadlinesPage"}, allEntries = true)
    public RegulatoryDeadline createDeadline(RegulatoryDeadline regulatoryDeadline) {
        RegulatoryDeadline sanitizedDeadline = sanitizeDeadline(regulatoryDeadline);
        validateDeadline(sanitizedDeadline);
        ensureDuplicateDoesNotExist(sanitizedDeadline, null);

        if (Boolean.FALSE.equals(sanitizedDeadline.getActive())) {
            throw new DeadlineOperationException("New deadlines cannot be created as inactive");
        }

        if (sanitizedDeadline.getActive() == null) {
            sanitizedDeadline.setActive(Boolean.TRUE);
        }

        return regulatoryDeadlineRepository.save(sanitizedDeadline);
    }

    @Override
    @CacheEvict(value = {"deadlineById", "deadlinesPage"}, allEntries = true)
    public RegulatoryDeadline updateDeadline(Long id, RegulatoryDeadline regulatoryDeadline) {
        RegulatoryDeadline existingDeadline = getActiveDeadline(id);
        RegulatoryDeadline sanitizedDeadline = sanitizeDeadline(regulatoryDeadline);
        validateDeadline(sanitizedDeadline);
        ensureDuplicateDoesNotExist(sanitizedDeadline, id);

        existingDeadline.setTitle(sanitizedDeadline.getTitle());
        existingDeadline.setRegulatoryBody(sanitizedDeadline.getRegulatoryBody());
        existingDeadline.setJurisdiction(sanitizedDeadline.getJurisdiction());
        existingDeadline.setCategory(sanitizedDeadline.getCategory());
        existingDeadline.setDescription(sanitizedDeadline.getDescription());
        existingDeadline.setDeadlineDate(sanitizedDeadline.getDeadlineDate());
        existingDeadline.setReminderDate(sanitizedDeadline.getReminderDate());
        existingDeadline.setStatus(sanitizedDeadline.getStatus());
        existingDeadline.setPriority(sanitizedDeadline.getPriority());
        existingDeadline.setResponsibleTeam(sanitizedDeadline.getResponsibleTeam());
        existingDeadline.setOwnerName(sanitizedDeadline.getOwnerName());
        existingDeadline.setOwnerEmail(sanitizedDeadline.getOwnerEmail());
        existingDeadline.setReferenceUrl(sanitizedDeadline.getReferenceUrl());
        existingDeadline.setAiDescription(sanitizedDeadline.getAiDescription());
        existingDeadline.setAiRecommendations(sanitizedDeadline.getAiRecommendations());
        existingDeadline.setRiskScore(sanitizedDeadline.getRiskScore());
        existingDeadline.setActive(sanitizedDeadline.getActive() == null ? existingDeadline.getActive() : sanitizedDeadline.getActive());

        return regulatoryDeadlineRepository.save(existingDeadline);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "deadlineById", key = "#id")
    public RegulatoryDeadline getDeadlineById(Long id) {
        return getActiveDeadline(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RegulatoryDeadline> getAllActiveDeadlines(Pageable pageable) {
        return regulatoryDeadlineRepository.findAllByActiveTrue(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "deadlinesPage", key = "T(String).format('%s-%s-%s', #page, #size, #sortBy)")
    public Page<RegulatoryDeadline> getAllActiveDeadlines(int page, int size, String sortBy) {
        validatePagination(page, size);
        validateSortField(sortBy);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());
        return regulatoryDeadlineRepository.findAllByActiveTrue(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RegulatoryDeadline> getDeadlinesByStatus(DeadlineStatus status, Pageable pageable) {
        if (status == null) {
            throw new InvalidDeadlineDataException("Status is required");
        }
        return regulatoryDeadlineRepository.findByStatusAndActiveTrue(status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RegulatoryDeadline> searchDeadlines(String keyword, Pageable pageable) {
        String normalizedKeyword = keyword == null ? "" : keyword.trim();
        if (normalizedKeyword.isBlank()) {
            throw new InvalidDeadlineDataException("Search keyword must not be blank");
        }
        return regulatoryDeadlineRepository.searchActiveByKeyword(normalizedKeyword, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RegulatoryDeadline> getDeadlinesByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        if (startDate == null || endDate == null) {
            throw new InvalidDeadlineDataException("Both start date and end date are required");
        }
        if (endDate.isBefore(startDate)) {
            throw new InvalidDeadlineDataException("End date must not be before start date");
        }
        return regulatoryDeadlineRepository.findByDeadlineDateBetweenAndActiveTrue(startDate, endDate, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegulatoryDeadline> getOverdueDeadlines() {
        return regulatoryDeadlineRepository.findByDeadlineDateBeforeAndStatusInAndActiveTrue(
                LocalDate.now(),
                OVERDUE_TRACKABLE_STATUSES
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Long countActiveDeadlinesByStatus(DeadlineStatus status) {
        if (status == null) {
            throw new InvalidDeadlineDataException("Status is required");
        }
        return regulatoryDeadlineRepository.countByStatusAndActiveTrue(status);
    }

    @Override
    @CacheEvict(value = {"deadlineById", "deadlinesPage"}, allEntries = true)
    public void softDeleteDeadline(Long id) {
        RegulatoryDeadline existingDeadline = getActiveDeadline(id);
        existingDeadline.setActive(Boolean.FALSE);
        existingDeadline.setStatus(DeadlineStatus.ARCHIVED);
        regulatoryDeadlineRepository.save(existingDeadline);
    }

    private RegulatoryDeadline getActiveDeadline(Long id) {
        if (id == null || id <= 0) {
            throw new InvalidDeadlineDataException("Deadline id must be a positive number");
        }

        return regulatoryDeadlineRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deadline not found with id: " + id));
    }

    private void ensureDuplicateDoesNotExist(RegulatoryDeadline deadline, Long id) {
        boolean duplicateExists = id == null
                ? regulatoryDeadlineRepository.existsByTitleIgnoreCaseAndRegulatoryBodyIgnoreCaseAndDeadlineDate(
                        deadline.getTitle(),
                        deadline.getRegulatoryBody(),
                        deadline.getDeadlineDate()
                )
                : regulatoryDeadlineRepository.existsByTitleIgnoreCaseAndRegulatoryBodyIgnoreCaseAndDeadlineDateAndIdNot(
                        deadline.getTitle(),
                        deadline.getRegulatoryBody(),
                        deadline.getDeadlineDate(),
                        id
                );

        if (duplicateExists) {
            throw new DuplicateDeadlineException("A deadline already exists for the same title, regulatory body, and date");
        }
    }

    private void validateDeadline(RegulatoryDeadline deadline) {
        if (deadline == null) {
            throw new InvalidDeadlineDataException("Deadline payload must not be null");
        }

        Set<ConstraintViolation<RegulatoryDeadline>> violations = validator.validate(deadline);
        if (!violations.isEmpty()) {
            String errorMessage = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .sorted()
                    .collect(Collectors.joining(", "));
            throw new InvalidDeadlineDataException(errorMessage);
        }

        if (deadline.getReminderDate() != null && deadline.getDeadlineDate() != null
                && deadline.getReminderDate().isAfter(deadline.getDeadlineDate())) {
            throw new InvalidDeadlineDataException("Reminder date must not be after deadline date");
        }

        if (deadline.getReferenceUrl() != null && !deadline.getReferenceUrl().isBlank()) {
            String url = deadline.getReferenceUrl().toLowerCase();
            if (!(url.startsWith("http://") || url.startsWith("https://"))) {
                throw new InvalidDeadlineDataException("Reference URL must start with http:// or https://");
            }
        }
    }

    private void validatePagination(int page, int size) {
        if (page < 0) {
            throw new InvalidDeadlineDataException("Page number must not be negative");
        }
        if (size <= 0) {
            throw new InvalidDeadlineDataException("Page size must be greater than zero");
        }
    }

    private void validateSortField(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            throw new InvalidDeadlineDataException("Sort field is required");
        }

        if (!ALLOWED_SORT_FIELDS.contains(sortBy.trim())) {
            throw new InvalidDeadlineDataException("Unsupported sort field: " + sortBy);
        }
    }

    private RegulatoryDeadline sanitizeDeadline(RegulatoryDeadline deadline) {
        if (deadline == null) {
            throw new InvalidDeadlineDataException("Deadline payload must not be null");
        }

        deadline.setTitle(trim(deadline.getTitle()));
        deadline.setRegulatoryBody(trim(deadline.getRegulatoryBody()));
        deadline.setJurisdiction(trim(deadline.getJurisdiction()));
        deadline.setCategory(trim(deadline.getCategory()));
        deadline.setDescription(trim(deadline.getDescription()));
        deadline.setResponsibleTeam(trim(deadline.getResponsibleTeam()));
        deadline.setOwnerName(trim(deadline.getOwnerName()));
        deadline.setOwnerEmail(trim(deadline.getOwnerEmail()));
        deadline.setReferenceUrl(trim(deadline.getReferenceUrl()));
        deadline.setAiDescription(trim(deadline.getAiDescription()));
        deadline.setAiRecommendations(trim(deadline.getAiRecommendations()));
        return deadline;
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
