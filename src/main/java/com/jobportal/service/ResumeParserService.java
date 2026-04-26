package com.jobportal.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeParserService {

    public String extractText(MultipartFile file) {
        try (PDDocument doc = PDDocument.load(file.getInputStream())) {
            return new PDFTextStripper().getText(doc);
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse PDF", e);
        }
    }

    public String extractSkills(String text) {
        List<String> keywords = List.of("Java", "Python", "SQL", "React", "Docker", "Spring", "AWS", "Node", "ML", "Git");
        return keywords.stream()
                .filter(k -> text.toLowerCase().contains(k.toLowerCase()))
                .collect(Collectors.joining(", "));
    }
}
