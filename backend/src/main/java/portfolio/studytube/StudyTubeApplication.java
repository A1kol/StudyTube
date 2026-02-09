package portfolio.studytube;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class StudyTubeApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudyTubeApplication.class, args);
    }

}
