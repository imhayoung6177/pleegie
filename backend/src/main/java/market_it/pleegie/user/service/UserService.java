package market_it.pleegie.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.common.security.JwtProvider;
import market_it.pleegie.user.entity.RefreshToken;
import market_it.pleegie.user.entity.User;
import market_it.pleegie.user.dto.UserCreateRequest;
import market_it.pleegie.user.dto.UserLoginRequest;
import market_it.pleegie.user.dto.UserLoginResponse;
import market_it.pleegie.user.dto.UserResponse;
import market_it.pleegie.user.dto.UserUpdateRequest;
import market_it.pleegie.user.dto.UserPasswordUpdateRequest;
import market_it.pleegie.user.repository.RefreshTokenRepository;
import market_it.pleegie.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.redis.core.RedisTemplate;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;
    private final RedisTemplate<String, String> redisTemplate;

    // ── 회원가입 ──────────────────────────────

    @Transactional
    public UserLoginResponse signup(UserCreateRequest request) {

        // 아이디 중복 체크
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new CustomException(ErrorCode.DUPLICATE_LOGIN_ID);
        }

        // 비밀번호 암호화 후 저장
        User user = request.toEntity(
                passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        String accessToken = jwtProvider.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId());

        refreshTokenRepository.save(
                new RefreshToken(
                        String.valueOf(user.getId()),
                        refreshToken)
                );

        return new UserLoginResponse(accessToken,refreshToken,UserResponse.from(user));

    }

    // ── 로그인 ────────────────────────────────

    @Transactional
    public UserLoginResponse login(UserLoginRequest request) {

        // 아이디 / 비밀번호 검증
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(
                        request.getLoginId(),
                        request.getPassword()));

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        // 정지 / 탈퇴 유저 체크
        if (user.getStatus().equals("SUSPENDED")) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        if (user.getStatus().equals("DELETED")) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        // JWT 발급
        String accessToken = jwtProvider.generateAccessToken(
                user.getId(), user.getRole());
        String refreshToken = jwtProvider.generateRefreshToken(
                user.getId());

        // Refresh Token Redis 저장
        refreshTokenRepository.save(
                new RefreshToken(
                        String.valueOf(user.getId()),
                        refreshToken));

        return new UserLoginResponse(
                accessToken, refreshToken,
                UserResponse.from(user));
    }

    // ── 토큰 재발급 ───────────────────────────

    @Transactional
    public UserLoginResponse reissue(String refreshToken) {

        // 토큰 유효성 검증
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        Long userId = jwtProvider.getUserId(refreshToken);

        // Redis에 저장된 토큰과 비교
        RefreshToken savedToken = refreshTokenRepository
                .findByRefreshToken(refreshToken)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.INVALID_TOKEN));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));

        // 새 토큰 발급
        String newAccessToken = jwtProvider.generateAccessToken(
                user.getId(), user.getRole());
        String newRefreshToken = jwtProvider.generateRefreshToken(
                user.getId());

        // Redis 업데이트
        refreshTokenRepository.save(
                new RefreshToken(
                        String.valueOf(userId),
                        newRefreshToken));

        return new UserLoginResponse(
                newAccessToken, newRefreshToken,
                UserResponse.from(user));
    }

    // ── 로그아웃 ──────────────────────────────

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteById(
                String.valueOf(userId));
    }

    // ── 내 정보 조회 ──────────────────────────

    public UserResponse getMyInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));
        return UserResponse.from(user);
    }

    // ── 내 정보 수정 ──────────────────────────

    @Transactional
    public UserResponse updateMyInfo(Long userId,
                                     UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));

        // User 엔티티에 updateInfo 메서드 추가 필요
        user.updateInfo(
                request.getName(),
                request.getPhone(),
                request.getEmail(),
                request.getAddress(),
                request.getLatitude(),
                request.getLongitude());

        return UserResponse.from(user);
    }

    // ── 비밀번호 변경 ─────────────────────────

    @Transactional
    public void updatePassword(Long userId,
                               UserPasswordUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        user.updatePassword(
                passwordEncoder.encode(request.getNewPassword()));
    }

    // ── 회원 탈퇴 ─────────────────────────────

    @Transactional
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));

        // 실제 삭제 대신 상태만 변경
        user.delete();

        // Redis Refresh Token 삭제
        refreshTokenRepository.deleteById(
                String.valueOf(userId));
    }


    @Transactional
    public UserLoginResponse signupAndLogin(
            UserCreateRequest request) {

        // 기존 회원가입 로직
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new CustomException(ErrorCode.DUPLICATE_LOGIN_ID);
        }

        User user = request.toEntity(
                passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        // 가입 후 바로 토큰 발급
        String accessToken = jwtProvider.generateAccessToken(
                user.getId(), user.getRole());
        String refreshToken = jwtProvider.generateRefreshToken(
                user.getId());

        // Redis에 refreshToken 저장
        redisTemplate.opsForValue().set(
                "refresh:" + user.getId(),
                refreshToken,
                14, TimeUnit.DAYS);

        return new UserLoginResponse(
                accessToken, refreshToken,
                UserResponse.from(user));
    }

}