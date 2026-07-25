package io.clouddesk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CloudDeskApplication {

    public static void main(String[] args) {
        SpringApplication.run(CloudDeskApplication.class, args);
    }
}
