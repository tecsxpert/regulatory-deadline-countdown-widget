package com.internship.tool.repository;

import com.internship.tool.entity.DeadlineStatus;
import com.internship.tool.entity.RegulatoryDeadline;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegulatoryDeadlineRepository extends JpaRepository<RegulatoryDeadline, Long> {

    Page<RegulatoryDeadline> findAllByActiveTrue(Pageable pageable);

    Optional<RegulatoryDeadline> findByIdAndActiveTrue(Long id);

    Page<RegulatoryDeadline> findByStatusAndActiveTrue(DeadlineStatus status, Pageable pageable);

    Page<RegulatoryDeadline> findByDeadlineDateBetweenAndActiveTrue(
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    );

    List<RegulatoryDeadline> findByDeadlineDateBeforeAndStatusInAndActiveTrue(
            LocalDate deadlineDate,
            Collection<DeadlineStatus> statuses
    );

    Long countByStatusAndActiveTrue(DeadlineStatus status);

    boolean existsByTitleIgnoreCaseAndRegulatoryBodyIgnoreCaseAndDeadlineDate(
            String title,
            String regulatoryBody,
            LocalDate deadlineDate
    );

    @Query("""
            select rd
            from RegulatoryDeadline rd
            where rd.active = true
              and (
                    lower(rd.title) like lower(concat('%', :keyword, '%'))
                 or lower(rd.regulatoryBody) like lower(concat('%', :keyword, '%'))
                 or lower(rd.jurisdiction) like lower(concat('%', :keyword, '%'))
                 or lower(rd.category) like lower(concat('%', :keyword, '%'))
              )
            """)
    Page<RegulatoryDeadline> searchActiveByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
