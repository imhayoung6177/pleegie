package market_it.pleegie.common.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import market_it.pleegie.item.entity.ItemMaster;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PythonApiClient {

    private final RestTemplate restTemplate;

    @Value("${ai.python-server-url}")
    private String pythonServerUrl;

    public void addIngredient(ItemMaster itemMaster) {
        try {
            Map<String, Object> body = Map.of(
                    "id",       itemMaster.getId(),
                    "name",     itemMaster.getName(),
                    "unit",     itemMaster.getUnit(),
                    "category", itemMaster.getCategory()
            );
            restTemplate.postForEntity(
                    pythonServerUrl + "/api/ingredients/add",
                    body,
                    Map.class
            );
            log.info("[PythonApiClient] chroma 단건 추가 완료: {}", itemMaster.getName());
        } catch (Exception e) {
            log.warn("[PythonApiClient] chroma 추가 실패 (무시): {}", e.getMessage());
        }
    }
}