package com.internship.tool.controller;

import com.internship.tool.entity.RegulatoryDeadline;
import com.internship.tool.exception.DeadlineOperationException;
import com.internship.tool.exception.DuplicateDeadlineException;
import com.internship.tool.exception.InvalidDeadlineDataException;
import com.internship.tool.exception.ResourceNotFoundException;
import com.internship.tool.service.RegulatoryDeadlineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/deadlines")
@RequiredArgsConstructor
public class RegulatoryDeadlineController {

    private final RegulatoryDeadlineService regulatoryDeadlineService;

    @GetMapping("/all")
    public ResponseEntity<Page<RegulatoryDeadline>> getAllDeadlines(
            @PageableDefault(size = 10, sort = "deadlineDate") Pageable pageable
    ) {
        return ResponseEntity.ok(regulatoryDeadlineService.getAllActiveDeadlines(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegulatoryDeadline> getDeadlineById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(regulatoryDeadlineService.getDeadlineById(id));
        } catch (ResourceNotFoundException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, exception.getMessage(), exception);
        } catch (InvalidDeadlineDataException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage(), exception);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<RegulatoryDeadline> createDeadline(@Valid @RequestBody RegulatoryDeadline regulatoryDeadline) {
        try {
            RegulatoryDeadline createdDeadline = regulatoryDeadlineService.createDeadline(regulatoryDeadline);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDeadline);
        } catch (DuplicateDeadlineException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage(), exception);
        } catch (InvalidDeadlineDataException | DeadlineOperationException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage(), exception);
        }
    }
}
