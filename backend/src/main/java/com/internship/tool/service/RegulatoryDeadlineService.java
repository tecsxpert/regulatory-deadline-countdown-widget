package com.internship.tool.service;

import com.internship.tool.entity.DeadlineStatus;
import com.internship.tool.entity.RegulatoryDeadline;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RegulatoryDeadlineService {

    RegulatoryDeadline createDeadline(RegulatoryDeadline regulatoryDeadline);

    RegulatoryDeadline updateDeadline(Long id, RegulatoryDeadline regulatoryDeadline);

    RegulatoryDeadline getDeadlineById(Long id);

    Page<RegulatoryDeadline> getAllActiveDeadlines(Pageable pageable);

    Page<RegulatoryDeadline> getAllActiveDeadlines(int page, int size, String sortBy);

    Page<RegulatoryDeadline> getDeadlinesByStatus(DeadlineStatus status, Pageable pageable);

    Page<RegulatoryDeadline> searchDeadlines(String keyword, Pageable pageable);

    Page<RegulatoryDeadline> getDeadlinesByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable);

    List<RegulatoryDeadline> getOverdueDeadlines();

    Long countActiveDeadlinesByStatus(DeadlineStatus status);

    void softDeleteDeadline(Long id);
}
