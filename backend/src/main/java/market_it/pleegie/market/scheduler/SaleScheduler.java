package market_it.pleegie.market.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import market_it.pleegie.market.entity.MarketItem;
import market_it.pleegie.market.repository.MarketItemRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SaleScheduler {

    private final MarketItemRepository marketItemRepository;

    // 매 분마다 실행
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void updateSaleStatus() {
        LocalDateTime now = LocalDateTime.now();

        // 할인 시작 시각 도달한 품목 → on_sale = true
        List<MarketItem> itemsToStart =
                marketItemRepository.findItemsToStartSale(now);
        itemsToStart.forEach(item -> {
            item.startSale(
                    item.getDiscountPrice(),
                    item.getDiscountRate(),
                    item.getStartTime(),
                    item.getEndTime());
            log.info("할인 시작 - itemId: {}", item.getId());
        });

        // 할인 종료 시각 도달한 품목 → on_sale = false
        List<MarketItem> itemsToEnd =
                marketItemRepository.findItemsToEndSale(now);
        itemsToEnd.forEach(item -> {
            item.endSale();
            log.info("할인 종료 - itemId: {}", item.getId());
        });
    }
}