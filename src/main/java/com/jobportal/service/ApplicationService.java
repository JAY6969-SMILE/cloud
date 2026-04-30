package com.jobportal.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.model.Application;
import com.jobportal.model.ApplicationStatus;
import com.jobportal.model.Job;
import com.jobportal.model.Role;
import com.jobportal.model.User;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeParserService resumeParserService;

    public ApplicationService(ApplicationRepository applicationRepository, JobRepository jobRepository,
                              UserRepository userRepository, ResumeParserService resumeParserService) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.resumeParserService = resumeParserService;
    }

    public Application apply(Long jobId, String email, MultipartFile resumeFile) {
        User applicant = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (applicant.getRole() != Role.JOBSEEKER) {
            throw new RuntimeException("Only jobseekers can apply");
        }

        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        if (applicationRepository.existsByJobAndApplicant(job, applicant)) {
            throw new RuntimeException("Already applied for this job");
        }

        String text = resumeParserService.extractText(resumeFile);
        String skills = resumeParserService.extractSkills(text);

        Application application = new Application();
        application.setJob(job);
        application.setApplicant(applicant);
        application.setResumeText(text);
        application.setSkills(skills);
        application.setStatus(ApplicationStatus.APPLIED);
        application.setAppliedAt(LocalDateTime.now());

        return applicationRepository.save(application);
    }

    public List<Application> getApplicationsForJob(Long jobId, String email) {
        User employer = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (employer.getRole() != Role.EMPLOYER) {
            throw new RuntimeException("Only employers can view applications");
        }

        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getPostedBy().getId().equals(employer.getId())) {
            throw new RuntimeException("You can only view applications for your own job");
        }

        return applicationRepository.findByJob(job);
    }

    public Application updateApplicationStatus(Long applicationId, String employerEmail, String status) {
        User employer = userRepository.findByEmail(employerEmail).orElseThrow(() -> new RuntimeException("User not found"));
        if (employer.getRole() != Role.EMPLOYER) {
            throw new RuntimeException("Only employers can update application status");
        }
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        Job job = application.getJob();
        if (!job.getPostedBy().getId().equals(employer.getId())) {
            throw new RuntimeException("You can only update applications for your own job");
        }
        switch (status) {
            case "ACCEPTED" -> application.setStatus(ApplicationStatus.REVIEWED);
            case "REJECTED" -> application.setStatus(ApplicationStatus.REJECTED);
            default -> throw new RuntimeException("Invalid status");
        }
        return applicationRepository.save(application);
    }

    public List<Application> getApplicationsForUser(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.findByApplicant(user);
    }
}
