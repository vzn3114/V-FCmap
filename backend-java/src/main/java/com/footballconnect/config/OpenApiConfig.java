package com.footballconnect.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI footballConnectOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Football Connect API")
                        .description("API tai lieu va thu nghiem truc tiep cho he thong dat san bong va ket noi doi bong.")
                        .version("v1")
                        .contact(new Contact()
                                .name("Football Connect Team")
                                .email("support@footballconnect.local"))
                        .license(new License()
                                .name("Internal Academic Use")
                                .url("https://example.com/license")));
    }
}
