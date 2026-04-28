package com.internship.tool.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.internship.tool.entity.DeadlinePriority;
import com.internship.tool.entity.DeadlineStatus;
import com.internship.tool.entity.RegulatoryDeadline;
import com.internship.tool.service.RegulatoryDeadlineService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

@ExtendWith(MockitoExtension.class)
class RegulatoryDeadlineControllerTest {

    @Mock
    private RegulatoryDeadlineService regulatoryDeadlineService;

    @InjectMocks
    private RegulatoryDeadlineController regulatoryDeadlineController;

    @Test
    void getAllDeadlinesShouldReturnPage() {
        Page<RegulatoryDeadline> page = new PageImpl<>(List.of(buildDeadline()));
        when(regulatoryDeadlineService.getAllActiveDeadlines(0, 10, "deadlineDate")).thenReturn(page);

        Page<RegulatoryDeadline> response = regulatoryDeadlineController.getAllDeadlines(0, 10, "deadlineDate").getBody();

        assertEquals(1, response.getTotalElements());
    }

    @Test
    void getDeadlineByIdShouldReturnEntity() {
        RegulatoryDeadline deadline = buildDeadline();
        deadline.setId(11L);
        when(regulatoryDeadlineService.getDeadlineById(11L)).thenReturn(deadline);

        RegulatoryDeadline response = regulatoryDeadlineController.getDeadlineById(11L).getBody();

        assertEquals(11L, response.getId());
    }

    @Test
    void createDeadlineShouldReturnCreatedResponse() {
        RegulatoryDeadline deadline = buildDeadline();
        when(regulatoryDeadlineService.createDeadline(deadline)).thenReturn(deadline);

        var response = regulatoryDeadlineController.createDeadline(deadline);

        assertEquals(201, response.getStatusCode().value());
        verify(regulatoryDeadlineService).createDeadline(deadline);
    }

    private RegulatoryDeadline buildDeadline() {
        return RegulatoryDeadline.builder()
                .title("Quarterly Filing")
                .regulatoryBody("RBI")
                .jurisdiction("India")
                .category("Compliance")
                .description("Submit report")
                .deadlineDate(LocalDate.now().plusDays(10))
                .reminderDate(LocalDate.now().plusDays(5))
                .status(DeadlineStatus.UPCOMING)
                .priority(DeadlinePriority.MEDIUM)
                .responsibleTeam("Compliance")
                .ownerName("Bindu")
                .ownerEmail("bindu@example.com")
                .active(Boolean.TRUE)
                .build();
    }
}
