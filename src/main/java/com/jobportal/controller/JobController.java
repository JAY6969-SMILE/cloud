package com.jobportal.controller;

import com.jobportal.model.Application;
import com.jobportal.model.Job;
import com.jobportal.service.ApplicationService;
import com.jobportal.service.JobService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final ApplicationService applicationService;

    public JobController(JobService jobService, ApplicationService applicationService) {
        this.jobService = jobService;
        this.applicationService = applicationService;
    }

    @PostMapping
    public Job createJob(@RequestBody JobCreateRequest request, Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Unauthorized");
        }
        Job job = new Job();
        job.setTitle(request.title());
        job.setDescription(request.description());
        job.setCompany(request.company());
        job.setLocation(request.location());
        job.setSalary(request.salary());
        return jobService.createJob(job, authentication.getName());
    }

    @GetMapping
    public List<Job> listJobs() {
        return jobService.getAllJobs();
    }

    @GetMapping("/{id}")
    public Job getJob(@PathVariable Long id) {
        return jobService.getJobById(id);
    }

    @PostMapping("/{id}/apply")
    public Application apply(@PathVariable Long id, @RequestParam("resume") MultipartFile resume,
                             Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Unauthorized");
        }
        return applicationService.apply(id, authentication.getName(), resume);
    }

    @GetMapping("/{id}/applications")
    public List<Application> getApplications(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Unauthorized");
        }
        return applicationService.getApplicationsForJob(id, authentication.getName());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        String message = ex.getMessage() == null ? "Request failed" : ex.getMessage();
        HttpStatus status = message.contains("Unauthorized") ? HttpStatus.UNAUTHORIZED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(Map.of("error", message));
    }

    public record JobCreateRequest(String title, String description, String company, String location, Double salary) {
    }

    // Accept application
    @PutMapping("/applications/{applicationId}/accept")
    public Application acceptApplication(@PathVariable Long applicationId, Authentication authentication) {
        if (authentication == null) throw new RuntimeException("Unauthorized");
        return applicationService.updateApplicationStatus(applicationId, authentication.getName(), "ACCEPTED");
    }

    // Reject application
    @PutMapping("/applications/{applicationId}/reject")
    public Application rejectApplication(@PathVariable Long applicationId, Authentication authentication) {
        if (authentication == null) throw new RuntimeException("Unauthorized");
        return applicationService.updateApplicationStatus(applicationId, authentication.getName(), "REJECTED");
    }
}
