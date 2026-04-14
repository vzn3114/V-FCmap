package com.footballconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Football Connect Platform - Main Application
 * 
 * @version 1.0.0
 * @author Football Connect Team
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
public class FootballConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(FootballConnectApplication.class, args);
    }
}
