package com.internship.tool.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.internship.tool.entity.DeadlinePriority;
import com.internship.tool.entity.DeadlineStatus;
import com.internship.tool.entity.RegulatoryDeadline;
import com.internship.tool.exception.DeadlineOperationException;
import com.internship.tool.exception.DuplicateDeadlineException;
import com.internship.tool.exception.InvalidDeadlineDataException;
import com.internship.tool.exception.ResourceNotFoundException;
import com.internship.tool.repository.RegulatoryDeadlineRepository;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class RegulatoryDeadlineServiceImplTest {

    @Mock
    private RegulatoryDeadlineRepository regulatoryDeadlineRepository;

    private Validator validator;

    @InjectMocks
    private RegulatoryDeadlineServiceImpl regulatoryDeadlineService;

    @BeforeEach
    void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
        regulatoryDeadlineService = new RegulatoryDeadlineServiceImpl(regulatoryDeadlineRepository, validator);
    }

    @Test
    void createDeadlineShouldSaveValidDeadline() {
        RegulatoryDeadline deadline = buildDeadline();
        when(regulatoryDeadlineRepository.existsByTitleIgnoreCaseAndRegulatoryBodyIgnoreCaseAndDeadlineDate(
                deadline.getTitle(),
                deadline.getRegulatoryBody(),
                deadline.getDeadlineDate()
        )).thenReturn(false);
        when(regulatoryDeadlineRepository.save(any(RegulatoryDeadline.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegulatoryDeadline savedDeadline = regulatoryDeadlineService.createDeadline(deadline);

        assertNotNull(savedDeadline);
        assertEquals("GDPR Filing", savedDeadline.getTitle());
        assertTrue(savedDeadline.getActive());
        verify(regulatoryDeadlineRepository).save(deadline);
    }

    @Test
    void createDeadlineShouldThrowWhenDuplicateExists() {
        RegulatoryDeadline deadline = buildDeadline();
        when(regulatoryDeadlineRepository.existsByTitleIgnoreCaseAndRegulatoryBodyIgnoreCaseAndDeadlineDate(
                deadline.getTitle(),
                deadline.getRegulatoryBody(),
                deadline.getDeadlineDate()
        )).thenReturn(true);

        assertThrows(DuplicateDeadlineException.class, () -> regulatoryDeadlineService.createDeadline(deadline));

        verify(regulatoryDeadlineRepository, never()).save(any(RegulatoryDeadline.class));
    }

    @Test
    void createDeadlineShouldThrowWhenReminderDateIsAfterDeadlineDate() {
        RegulatoryDeadline deadline = buildDeadline();
        deadline.setReminderDate(deadline.getDeadlineDate().plusDays(1));

        assertThrows(InvalidDeadlineDataException.class, () -> regulatoryDeadlineService.createDeadline(deadline));

        verify(regulatoryDeadlineRepository, never()).save(any(RegulatoryDeadline.class));
    }

    @Test
    void getDeadlineByIdShouldReturnActiveDeadline() {
        RegulatoryDeadline deadline = buildDeadline();
        deadline.setId(1L);
        when(regulatoryDeadlineRepository.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(deadline));

        RegulatoryDeadline foundDeadline = regulatoryDeadlineService.getDeadlineById(1L);

        assertEquals(1L, foundDeadline.getId());
        assertEquals("GDPR Filing", foundDeadline.getTitle());
    }

    @Test
    void getDeadlineByIdShouldThrowWhenDeadlineDoesNotExist() {
        when(regulatoryDeadlineRepository.findByIdAndActiveTrue(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> regulatoryDeadlineService.getDeadlineById(99L));
    }

    @Test
    void searchDeadlinesShouldThrowWhenKeywordIsBlank() {
        Pageable pageable = PageRequest.of(0, 10);

        assertThrows(InvalidDeadlineDataException.class, () -> regulatoryDeadlineService.searchDeadlines("   ", pageable));
    }

    @Test
    void getDeadlinesByDateRangeShouldThrowWhenEndDateIsBeforeStartDate() {
        Pageable pageable = PageRequest.of(0, 10);

        assertThrows(
                InvalidDeadlineDataException.class,
                () -> regulatoryDeadlineService.getDeadlinesByDateRange(LocalDate.now(), LocalDate.now().minusDays(1), pageable)
        );
    }

    @Test
    void getOverdueDeadlinesShouldReturnRepositoryResults() {
        RegulatoryDeadline overdueDeadline = buildDeadline();
        overdueDeadline.setId(7L);
        when(regulatoryDeadlineRepository.findByDeadlineDateBeforeAndStatusInAndActiveTrue(any(LocalDate.class), any()))
                .thenReturn(List.of(overdueDeadline));

        List<RegulatoryDeadline> overdueDeadlines = regulatoryDeadlineService.getOverdueDeadlines();

        assertEquals(1, overdueDeadlines.size());
        assertEquals(7L, overdueDeadlines.get(0).getId());
    }

    @Test
    void countActiveDeadlinesByStatusShouldThrowWhenStatusIsNull() {
        assertThrows(InvalidDeadlineDataException.class, () -> regulatoryDeadlineService.countActiveDeadlinesByStatus(null));
    }

    @Test
    void softDeleteDeadlineShouldArchiveDeadline() {
        RegulatoryDeadline deadline = buildDeadline();
        deadline.setId(10L);
        when(regulatoryDeadlineRepository.findByIdAndActiveTrue(10L)).thenReturn(Optional.of(deadline));
        when(regulatoryDeadlineRepository.save(any(RegulatoryDeadline.class))).thenAnswer(invocation -> invocation.getArgument(0));

        regulatoryDeadlineService.softDeleteDeadline(10L);

        assertFalse(deadline.getActive());
        assertEquals(DeadlineStatus.ARCHIVED, deadline.getStatus());
        verify(regulatoryDeadlineRepository).save(deadline);
    }

    @Test
    void createDeadlineShouldRejectInactivePayload() {
        RegulatoryDeadline deadline = buildDeadline();
        deadline.setActive(Boolean.FALSE);
        when(regulatoryDeadlineRepository.existsByTitleIgnoreCaseAndRegulatoryBodyIgnoreCaseAndDeadlineDate(
                deadline.getTitle(),
                deadline.getRegulatoryBody(),
                deadline.getDeadlineDate()
        )).thenReturn(false);

        assertThrows(DeadlineOperationException.class, () -> regulatoryDeadlineService.createDeadline(deadline));

        verify(regulatoryDeadlineRepository, never()).save(any(RegulatoryDeadline.class));
    }

    @Test
    void getAllActiveDeadlinesShouldRejectNegativePage() {
        assertThrows(InvalidDeadlineDataException.class, () -> regulatoryDeadlineService.getAllActiveDeadlines(-1, 10, "deadlineDate"));
    }

    @Test
    void getAllActiveDeadlinesShouldRejectZeroSize() {
        assertThrows(InvalidDeadlineDataException.class, () -> regulatoryDeadlineService.getAllActiveDeadlines(0, 0, "deadlineDate"));
    }

    @Test
    void getAllActiveDeadlinesShouldRejectUnsupportedSortField() {
        assertThrows(InvalidDeadlineDataException.class, () -> regulatoryDeadlineService.getAllActiveDeadlines(0, 10, "invalidSort"));
    }

    @Test
    void getAllActiveDeadlinesShouldReturnRepositoryPage() {
        RegulatoryDeadline deadline = buildDeadline();
        Page<RegulatoryDeadline> page = new PageImpl<>(List.of(deadline));
        when(regulatoryDeadlineRepository.findAllByActiveTrue(any(Pageable.class))).thenReturn(page);

        Page<RegulatoryDeadline> result = regulatoryDeadlineService.getAllActiveDeadlines(0, 10, "deadlineDate");

        assertEquals(1, result.getTotalElements());
        verify(regulatoryDeadlineRepository).findAllByActiveTrue(any(Pageable.class));
    }

    @Test
    void searchDeadlinesShouldTrimKeywordBeforeSearching() {
        Page<RegulatoryDeadline> page = new PageImpl<>(List.of(buildDeadline()));
        when(regulatoryDeadlineRepository.searchActiveByKeyword(any(String.class), any(Pageable.class))).thenReturn(page);

        Page<RegulatoryDeadline> result = regulatoryDeadlineService.searchDeadlines("  gdpr  ", PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        verify(regulatoryDeadlineRepository).searchActiveByKeyword("gdpr", PageRequest.of(0, 10));
    }

    @Test
    void updateDeadlineShouldPersistSanitizedValues() {
        RegulatoryDeadline existing = buildDeadline();
        existing.setId(20L);
        RegulatoryDeadline updatePayload = buildDeadline();
        updatePayload.setTitle("  Updated Filing  ");
        updatePayload.setResponsibleTeam("  Updated Team  ");
        updatePayload.setOwnerEmail("  updated@example.com  ");
        when(regulatoryDeadlineRepository.findByIdAndActiveTrue(20L)).thenReturn(Optional.of(existing));
        when(regulatoryDeadlineRepository.existsByTitleIgnoreCaseAndRegulatoryBodyIgnoreCaseAndDeadlineDateAndIdNot(
                "Updated Filing",
                updatePayload.getRegulatoryBody(),
                updatePayload.getDeadlineDate(),
                20L
        )).thenReturn(false);
        when(regulatoryDeadlineRepository.save(any(RegulatoryDeadline.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegulatoryDeadline updated = regulatoryDeadlineService.updateDeadline(20L, updatePayload);

        assertEquals("Updated Filing", updated.getTitle());
        assertEquals("Updated Team", updated.getResponsibleTeam());
        assertEquals("updated@example.com", updated.getOwnerEmail());
    }

    private RegulatoryDeadline buildDeadline() {
        return RegulatoryDeadline.builder()
                .id(1L)
                .title("GDPR Filing")
                .regulatoryBody("Data Protection Authority")
                .jurisdiction("EU")
                .category("Compliance")
                .description("Submit the quarterly filing")
                .deadlineDate(LocalDate.now().plusDays(5))
                .reminderDate(LocalDate.now().plusDays(2))
                .status(DeadlineStatus.UPCOMING)
                .priority(DeadlinePriority.HIGH)
                .responsibleTeam("Compliance Team")
                .ownerName("Asha")
                .ownerEmail("asha@example.com")
                .referenceUrl("https://example.com/gdpr")
                .aiDescription("AI summary")
                .aiRecommendations("AI recommendation")
                .riskScore(75)
                .active(Boolean.TRUE)
                .build();
    }
}
