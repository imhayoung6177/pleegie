package market_it.pleegie.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SimilarityService {
    private final RestTemplate restTemplate;

    @Value("${foodsafety.api.service-key}")
    private String serviceKey;

    @Value("${foodsafety.api.base-url}")
    private String baseUrl;

    // 전국 식재료 표준 데이터 리스트 (나중에는 API에서 받아올 목록입니다!)
    private final List<String> standardItems = Arrays.asList("감자", "고구마", "양파", "대파", "무", "배추", "당근", "사과");

    /**
     * 입력된 이름을 표준 이름으로 바꿔주는 서비스
     */
    public String findStandardName(String inputName) {
        // 1. 공백 제거 (Trim)
        String trimmedName = inputName.trim();

        String bestMatch = trimmedName; // 가장 닮은 단어를 저장할 변수
        double maxSimilarity = 0.0;     // 가장 높은 유사도 점수

        // 2. 우리 시스템의 표준 리스트와 하나씩 비교해봅니다.
        for (String standard : standardItems) {
            double currentSim = calculateSimilarity(trimmedName, standard);

            // 더 닮은 단어를 찾으면 업데이트!
            if (currentSim > maxSimilarity) {
                maxSimilarity = currentSim;
                bestMatch = standard;
            }
        }

        // 3. 점수가 0.4(40% 이상 닮음) 이상일 때만 표준어로 바꿔줍니다.
        // 너무 안 닮았으면(예: "초콜릿" 입력 시) 그냥 입력값 그대로 씁니다.
        return (maxSimilarity >= 0.4) ? bestMatch : trimmedName;
    }

    /**
     * 📏 유사도 계산기 (비유: 글자 겹치기 점수 매기기)
     */
    private double calculateSimilarity(String s1, String s2) {
        // 두 단어에서 공통으로 들어있는 글자 수를 셉니다.
        long commonChars = s1.chars()
                .filter(c -> s2.indexOf(c) >= 0)
                .count();

        // 겹치는 글자 수 / 가장 긴 단어의 길이 = 유사도 점수 (0.0 ~ 1.0)
        return (double) commonChars / Math.max(s1.length(), s2.length());
    }

    /**
     * 🔍 식약처 API를 통해 표준 식재료 명칭을 찾아오는 메서드
     */
    public String fetchStandardNameFromApi(String inputName) {
        // 1. 주소 조립 (URL 빌딩)
        // 비유: 백과사전의 특정 페이지(검색어)를 펼치기 위해 주소를 적는 과정입니다.
        String url = String.format("%s?serviceKey=%s&prdlst_nm=%s&type=json",
                baseUrl, serviceKey, inputName);

        try {
            // 2. API 호출 및 응답 받기
            // RestTemplate이 실제로 국가 서버에 가서 데이터를 받아옵니다.
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            System.out.println("식약처 API 응답 결과: " + response); // 데이터가 어떻게 오는지 확인!

            // 3. 데이터 추출 (실제 구현 시 JSON 구조에 맞춰 파싱이 필요합니다)
            // 여기서는 개념 설명을 위해 '성공적으로 찾았다면 그 이름을 반환'하는 것으로 가정합니다.
            if (response != null && response.containsKey("body")) {
                // API 응답 구조에 따라 표준 명칭을 꺼내서 반환합니다.
                return "API에서 찾은 표준 명칭";
            }
        } catch (Exception e) {
            // API가 응답하지 않을 때를 대비한 '대비책(Fallback)'
            return inputName;
        }
        return inputName;
    }
}