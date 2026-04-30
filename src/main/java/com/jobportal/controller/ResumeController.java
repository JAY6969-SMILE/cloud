package com.jobportal.controller;

import com.jobportal.service.ResumeParserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeParserService resumeParserService;

    public ResumeController(ResumeParserService resumeParserService) {
        this.resumeParserService = resumeParserService;
    }

    @PostMapping("/parse")
    public Map<String, String> parse(@RequestParam("resume") MultipartFile resume) {
        String text = resumeParserService.extractText(resume);
        String skills = resumeParserService.extractSkills(text);
        return Map.of(
                "text", text,
                "skills", skills
        );
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        String message = ex.getMessage() == null ? "Request failed" : ex.getMessage();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", message));
    }
}