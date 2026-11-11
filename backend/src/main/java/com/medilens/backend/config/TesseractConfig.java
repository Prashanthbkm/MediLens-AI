package com.medilens.backend.config;

import net.sourceforge.tess4j.Tesseract;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TesseractConfig {

    private static final String TESSERACT_DATA_PATH =
            "C:/Program Files/Tesseract-OCR/tessdata";

    @Bean
    public Tesseract tesseract() {

        Tesseract tesseract = new Tesseract();

        // Tesseract installation directory
        tesseract.setDatapath(TESSERACT_DATA_PATH);

        // English language
        tesseract.setLanguage("eng");

        return tesseract;
    }
}
