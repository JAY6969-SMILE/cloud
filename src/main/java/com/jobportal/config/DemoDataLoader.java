package com.jobportal.config;

import com.jobportal.model.Job;
import com.jobportal.model.Role;
import com.jobportal.model.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DemoDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataLoader(UserRepository userRepository, JobRepository jobRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        User employer = userRepository.findByEmail("employer@test.com").orElseGet(() -> {
            User user = new User();
            user.setName("Demo Employer");
            user.setEmail("employer@test.com");
            user.setPassword(passwordEncoder.encode("Employer@123"));
            user.setRole(Role.EMPLOYER);
            return userRepository.save(user);
        });

        userRepository.findByEmail("jobseeker@test.com").orElseGet(() -> {
            User user = new User();
            user.setName("Demo Jobseeker");
            user.setEmail("jobseeker@test.com");
            user.setPassword(passwordEncoder.encode("Jobseeker@123"));
            user.setRole(Role.JOBSEEKER);
            return userRepository.save(user);
        });

        if (jobRepository.count() == 0) {
            Job jobOne = new Job();
            jobOne.setTitle("Senior Java Spring Developer");
            jobOne.setCompany("Acme Technologies");
            jobOne.setLocation("Remote");
            jobOne.setSalary(85000.0);
            jobOne.setDescription("Build secure REST APIs, manage PostgreSQL data, and work on JWT auth.");
            jobOne.setPostedBy(employer);
            jobOne.setCreatedAt(LocalDateTime.now());
            jobRepository.save(jobOne);

            Job jobTwo = new Job();
            jobTwo.setTitle("Frontend Engineer");
            jobTwo.setCompany("Northstar Digital");
            jobTwo.setLocation("Hybrid");
            jobTwo.setSalary(72000.0);
            jobTwo.setDescription("Work with HTML, CSS, JavaScript, and polished UI experiences.");
            jobTwo.setPostedBy(employer);
            jobTwo.setCreatedAt(LocalDateTime.now());
            jobRepository.save(jobTwo);

            Job jobThree = new Job();
            jobThree.setTitle("Cloud Support Associate");
            jobThree.setCompany("Skyline Cloud");
            jobThree.setLocation("Bangalore");
            jobThree.setSalary(62000.0);
            jobThree.setDescription("Support AWS deployments, Docker images, and application operations.");
            jobThree.setPostedBy(employer);
            jobThree.setCreatedAt(LocalDateTime.now());
            jobRepository.save(jobThree);
        }
    }
}