package market_it.pleegie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
@ComponentScan(basePackages = "market_it.pleegie")
public class PleegieApplication {

	public static void main(String[] args) {
		SpringApplication.run(PleegieApplication.class, args);
	}

}
