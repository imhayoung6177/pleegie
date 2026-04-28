package market_it.pleegie.market.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.common.util.QrCodeUtil;
import market_it.pleegie.coupon.entity.Coupon;
import market_it.pleegie.coupon.repository.CouponRepository;
import market_it.pleegie.item.entity.ItemMaster;
import market_it.pleegie.item.repository.ItemMasterRepository;
import market_it.pleegie.market.dto.*;
import market_it.pleegie.market.entity.Market;
import market_it.pleegie.market.entity.MarketItem;
import market_it.pleegie.market.repository.MarketItemRepository;
import market_it.pleegie.market.repository.MarketRepository;
import market_it.pleegie.user.entity.User;
import market_it.pleegie.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MarketService {

    private final MarketRepository marketRepository;
    private final MarketItemRepository marketItemRepository;
    private final UserRepository userRepository;
    private final ItemMasterRepository itemMasterRepository;
    private final CouponRepository couponRepository;
    private final QrCodeUtil qrCodeUtil;

    // ── 시장 등록 ─────────────────────────────

    @Transactional
    public MarketResponse createMarket(Long userId, MarketCreateRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 이미 시장 등록했는지 확인
        if (marketRepository.existsByUserId(userId)) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // 사업자등록번호 중복 확인
        if (marketRepository.existsByBusinessNumber(request.getBusinessNumber())) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // QR 토큰 생성
        String qrToken = UUID.randomUUID().toString();

        //QR 코드 이미지 생성
        String qrCodeUrl = qrCodeUtil.generateQrCodeBase64(qrToken);

        Market market = Market.builder()
                .user(user)
                .name(request.getName())
                .ceoName(request.getCeoName())
                .businessNumber(request.getBusinessNumber())
                .phone(request.getPhone())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .qrToken(qrToken)
                .qrCodeUrl(qrCodeUrl)
                .build();

        marketRepository.save(market);

        // 시장 등록 시 쿠폰 자동 생성
        Coupon coupon = Coupon.builder()
                .market(market)
                .name(market.getName() + " 스탬프 쿠폰")
                .requiredStampCount(10)
                .build();

        couponRepository.save(coupon);

        log.info("시장 등록 완료 - marketId: {}, qrToken: {}",
                market.getId(), qrToken);

        return MarketResponse.from(market);
    }

    // ── 내 시장 조회 ──────────────────────────

    public MarketResponse getMyMarket(Long userId) {
        Market market = marketRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.MARKET_NOT_FOUND));
        return MarketResponse.from(market);
    }

    // ── 시장 정보 수정 ────────────────────────

    @Transactional
    public MarketResponse updateMarket(Long userId, MarketCreateRequest request) {

        Market market = marketRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.MARKET_NOT_FOUND));

        market.updateInfo(
                request.getName(),
                request.getCeoName(),
                request.getPhone(),
                request.getLatitude(),
                request.getLongitude()
        );
        return MarketResponse.from(market);
    }

    // ── QR 코드 재발급 ────────────────────────

    @Transactional
    public MarketResponse reissueQr(Long userId) {

        Market market = marketRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.MARKET_NOT_FOUND));

        // 새 QR 토큰 생성
        String newQrToken = UUID.randomUUID().toString();
        String newQrCodeUrl = qrCodeUtil.generateQrCodeBase64(newQrToken);

        market.updateQr(newQrToken, newQrCodeUrl);

        log.info("QR 재발급 완료 - marketId: {}", market.getId());

        return MarketResponse.from(market);
    }

    // ── QR 코드 재발급 ────────────────────────

    public MarketResponse getMarketByQrToken(String qrToken) {
        Market market = marketRepository
                .findByQrToken(qrToken)
                .orElseThrow(() -> new CustomException(ErrorCode.MARKET_NOT_FOUND));

        // 승인된 시장인지 확인
        if (!market.getStatus().equals("APPROVED")) {
            throw new CustomException(ErrorCode.MARKET_NOT_APPROVED);
        }
        return MarketResponse.from(market);
    }

    // ── 가까운 시장 목록 조회 ─────────────────

    public List<MarketResponse> getNearestMarkets(Double latitude, Double longitude) {
        return marketRepository
                .findNearestMarkets(latitude, longitude)
                .stream()
                .map(MarketResponse::from)
                .collect(Collectors.toList());
    }

    // ── 품목 등록 ─────────────────────────────

    @Transactional
    public MarketItemResponse createMarketItem(Long userId,
                                               MarketItemCreateRequest request) {

        Market market = marketRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.MARKET_NOT_FOUND));

        // 승인된 시장인지 확인
        if (!market.getStatus().equals("APPROVED")) {
            throw new CustomException(
                    ErrorCode.MARKET_NOT_APPROVED);
        }

        ItemMaster itemMaster = itemMasterRepository
                .findById(request.getItemMasterId())
                .orElseThrow(() -> new CustomException(
                        ErrorCode.INVALID_INPUT));

        MarketItem marketItem = request.toEntity(
                market, itemMaster);
        marketItemRepository.save(marketItem);

        return MarketItemResponse.from(marketItem);
    }

    // ── 품목 목록 조회 ────────────────────────

    public List<MarketItemResponse> getMarketItems(
            Long userId) {

        Market market = marketRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.MARKET_NOT_FOUND));

        return marketItemRepository
                .findAllByMarketId(market.getId())
                .stream()
                .map(MarketItemResponse::from)
                .collect(Collectors.toList());
    }

    // ── 품목 수정 ─────────────────────────────

    @Transactional
    public MarketItemResponse updateMarketItem(Long userId,
                                               Long itemId, MarketItemUpdateRequest request) {

        MarketItem marketItem =
                getMarketItemWithAuth(userId, itemId);

        marketItem.updateInfo(
                request.getName(),
                request.getCategory(),
                request.getOriginalPrice(),
                request.getImageUrl(),
                request.getStock());

        return MarketItemResponse.from(marketItem);
    }

    // ── 품목 삭제 ─────────────────────────────

    @Transactional
    public void deleteMarketItem(Long userId, Long itemId) {
        MarketItem marketItem =
                getMarketItemWithAuth(userId, itemId);
        marketItemRepository.delete(marketItem);
    }

    // ── 할인 등록 ─────────────────────────────

    @Transactional
    public MarketItemResponse startSale(Long userId,
                                        Long itemId, MarketItemSaleRequest request) {

        // 둘 다 없으면 예외
        if (!request.isValid()) {
            throw new CustomException(ErrorCode.INVALID_DISCOUNT);
        }

        MarketItem marketItem =
                getMarketItemWithAuth(userId, itemId);

        // 할인율만 입력한 경우 → 할인 가격 자동 계산
        Integer discountPrice = request.getDiscountPrice();
        Integer discountRate = request.getDiscountRate();

        if (discountPrice == null && discountRate != null) {
            // 할인율로 할인 가격 계산
            // 예) 원가 10000원, 할인율 20% → 8000원
            discountPrice = marketItem.getOriginalPrice()
                    * (100 - discountRate) / 100;
        }

        if (discountRate == null && discountPrice != null) {
            // 할인 가격으로 할인율 계산
            // 예) 원가 10000원, 할인가 8000원 → 20%
            discountRate = (marketItem.getOriginalPrice()
                    - discountPrice) * 100
                    / marketItem.getOriginalPrice();
        }

        marketItem.startSale(
                discountPrice,
                discountRate,
                request.getStartTime(),
                request.getEndTime());

        return MarketItemResponse.from(marketItem);
    }

    // ── 할인 취소 ─────────────────────────────

    @Transactional
    public MarketItemResponse cancelSale(Long userId,
                                         Long itemId) {

        MarketItem marketItem =
                getMarketItemWithAuth(userId, itemId);

        marketItem.endSale();

        return MarketItemResponse.from(marketItem);
    }

    // ── 내부 메서드 ───────────────────────────

    // 본인 시장 품목인지 확인
    private MarketItem getMarketItemWithAuth(Long userId,
                                             Long itemId) {
        Market market = marketRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.MARKET_NOT_FOUND));

        MarketItem marketItem = marketItemRepository
                .findById(itemId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.INVALID_INPUT));

        // 본인 시장 품목인지 확인
        if (!marketItem.getMarket().getId()
                .equals(market.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        return marketItem;
    }
}
