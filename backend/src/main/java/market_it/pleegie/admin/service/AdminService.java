package market_it.pleegie.admin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import market_it.pleegie.admin.dto.AdminLoginRequest;
import market_it.pleegie.admin.dto.AdminResponse;
import market_it.pleegie.admin.entity.Admin;
import market_it.pleegie.admin.repository.AdminRepository;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.common.security.JwtProvider;
import market_it.pleegie.local_currency.entity.LocalCurrencyLog;
import market_it.pleegie.local_currency.repository.LocalCurrencyLogRepository;
import market_it.pleegie.notice.dto.NoticeCreateRequest;
import market_it.pleegie.notice.dto.NoticeResponse;
import market_it.pleegie.notice.entity.Notice;
import market_it.pleegie.notice.repository.NoticeRepository;
import market_it.pleegie.report.dto.ReportResponse;
import market_it.pleegie.report.entity.Report;
import market_it.pleegie.report.repository.ReportRepository;
import market_it.pleegie.user.dto.UserLoginResponse;
import market_it.pleegie.user.dto.UserResponse;
import market_it.pleegie.user.entity.User;
import market_it.pleegie.user.repository.UserRepository;
import market_it.pleegie.market.entity.Market;
import market_it.pleegie.market.repository.MarketRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final MarketRepository marketRepository;
    private final ReportRepository reportRepository;
    private final NoticeRepository noticeRepository;
    private final LocalCurrencyLogRepository
            localCurrencyLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    // ── 관리자 로그인 ─────────────────────────

    @Transactional
    public UserLoginResponse login(AdminLoginRequest request) {

        Admin admin = adminRepository
                .findByLoginId(request.getLoginId())
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));

        // 비밀번호 확인
        if (!passwordEncoder.matches(
                request.getPassword(),
                admin.getPassword())) {
            throw new CustomException(
                    ErrorCode.INVALID_PASSWORD);
        }

        // JWT 발급 (role = ADMIN)
        String accessToken = jwtProvider
                .generateAccessToken(
                        admin.getId(), "ADMIN");
        String refreshToken = jwtProvider
                .generateRefreshToken(admin.getId());

        return new UserLoginResponse(
                accessToken, refreshToken, null);
    }

    // ── 회원 관리 ─────────────────────────────

    // 전체 회원 목록 조회
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByRole("USER")
                .stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    // 회원 상태 변경 (정상/정지/강제탈퇴)
    @Transactional
    public UserResponse updateUserStatus(
            Long userId, String status) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));

        switch (status) {
            case "ACTIVE"    -> user.updateStatus("ACTIVE");
            case "SUSPENDED" -> user.suspend();
            case "DELETED"   -> user.delete();
            default -> throw new CustomException(
                    ErrorCode.INVALID_INPUT);
        }

        return UserResponse.from(user);
    }

    // ── 사업자 관리 ───────────────────────────

    // 전체 사업자 목록 조회
    public List<UserResponse> getAllMarkets() {
        return userRepository.findAllByRole("MARKET")
                .stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    // 사업자 승인
    @Transactional
    public UserResponse approveMarket(Long marketId) {

        Market market = marketRepository.findById(marketId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.MARKET_NOT_FOUND));

        market.approve();

        return UserResponse.from(market.getUser());
    }

    // 사업자 반려
    @Transactional
    public UserResponse rejectMarket(Long marketId) {

        Market market = marketRepository.findById(marketId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.MARKET_NOT_FOUND));

        market.suspend();

        return UserResponse.from(market.getUser());
    }

    // ── 신고 관리 ─────────────────────────────

    // 전체 신고 목록 조회
    public List<ReportResponse> getAllReports() {
        return reportRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ReportResponse::from)
                .collect(Collectors.toList());
    }

    // 상태별 신고 목록 조회
    public List<ReportResponse> getReportsByStatus(
            String status) {
        return reportRepository
                .findAllByStatusOrderByCreatedAtAsc(status)
                .stream()
                .map(ReportResponse::from)
                .collect(Collectors.toList());
    }

    // 신고 처리 (경고/정지/반려)
    @Transactional
    public ReportResponse updateReportStatus(
            Long reportId, String status) {

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.INVALID_INPUT));

        report.updateStatus(status);

        return ReportResponse.from(report);
    }

    // ── 공지 관리 ─────────────────────────────

    // 전체 공지 목록 조회
    public List<NoticeResponse> getAllNotices() {
        return noticeRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(NoticeResponse::from)
                .collect(Collectors.toList());
    }

    // 공지 작성
    @Transactional
    public NoticeResponse createNotice(
            Long adminId,
            NoticeCreateRequest request) {

        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));

        Notice notice = request.toEntity(admin);
        noticeRepository.save(notice);

        return NoticeResponse.from(notice);
    }

    // 공지 수정
    @Transactional
    public NoticeResponse updateNotice(
            Long noticeId,
            NoticeCreateRequest request) {

        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.INVALID_INPUT));

        notice.update(
                request.getTitle(),
                request.getContent(),
                request.getTargetType());

        return NoticeResponse.from(notice);
    }

    // 공지 삭제
    @Transactional
    public void deleteNotice(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.INVALID_INPUT));
        noticeRepository.delete(notice);
    }

    // ── 지역화폐 관리 ─────────────────────────

    // 지역화폐 신청 목록 조회
    public List<LocalCurrencyLog> getLocalCurrencyRequests() {
        return localCurrencyLogRepository
                .findAllByStatusOrderByRequestedAtAsc(
                        "REQUESTED");
    }

    // 지역화폐 승인
    @Transactional
    public void approveLocalCurrency(
            Long logId, Long adminId) {

        LocalCurrencyLog log = localCurrencyLogRepository
                .findById(logId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.INVALID_INPUT));

        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));

        // 승인 처리
        log.approve(admin);

        // 쿠폰 초기화
        log.getUserCoupon().reset();
    }

    // 지역화폐 반려
    @Transactional
    public void rejectLocalCurrency(
            Long logId, Long adminId) {

        LocalCurrencyLog log = localCurrencyLogRepository
                .findById(logId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.INVALID_INPUT));

        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));

        log.reject(admin);
    }

    // 신고 삭제 기능을 위한 메서드 추가 << 5.6 종빈 추가 >>
    @Transactional
    public void deleteReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));
        reportRepository.delete(report);
    }
}