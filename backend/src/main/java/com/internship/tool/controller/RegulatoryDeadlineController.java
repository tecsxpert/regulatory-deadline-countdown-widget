package com.internship.tool.controller;

import com.internship.tool.entity.RegulatoryDeadline;
import com.internship.tool.service.RegulatoryDeadlineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/deadlines")
@RequiredArgsConstructor
public class RegulatoryDeadlineController {

    private final RegulatoryDeadlineService regulatoryDeadlineService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Page<RegulatoryDeadline>> getAllDeadlines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "deadlineDate") String sortBy
    ) {
        return ResponseEntity.ok(regulatoryDeadlineService.getAllActiveDeadlines(page, size, sortBy));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<RegulatoryDeadline> getDeadlineById(@PathVariable Long id) {
        return ResponseEntity.ok(regulatoryDeadlineService.getDeadlineById(id));
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<RegulatoryDeadline> createDeadline(@Valid @RequestBody RegulatoryDeadline regulatoryDeadline) {
        RegulatoryDeadline createdDeadline = regulatoryDeadlineService.createDeadline(regulatoryDeadline);
        return ResponseEntity.status(201).body(createdDeadline);
    }
}
