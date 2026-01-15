package com.buneko.blooms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class BunekoBloomsApplication {
    public static void main(String[] args) {
        SpringApplication.run(BunekoBloomsApplication.class, args);
    }
}

