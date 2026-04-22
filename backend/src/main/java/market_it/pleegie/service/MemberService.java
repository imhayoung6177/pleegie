package market_it.pleegie.service;

import market_it.pleegie.common.security.JwtTokenProvider;
import market_it.pleegie.domain.user.entity.RefreshToken;
import market_it.pleegie.dto.BusinessVerifyResponseDto;
import market_it.pleegie.dto.PasswordResetRequestDto;
import market_it.pleegie.domain.Member;
import market_it.pleegie.domain.Stamp;
import market_it.pleegie.repository.MemberRepository;
import market_it.pleegie.repository.StampRepository;
import market_it.pleegie.repository.user.RefreshTokenRepository;
import market_it.pleegie.utils.QRCodeUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate;
    private final StampRepository stampRepository;
    private final QRCodeUtil qrCodeUtil;

    // QR 이미지가 저장될 실제 컴퓨터 폴더 위치
    private final String qrUploadPath = System.getProperty("user.dir") + "/uploads/qr/";

    @Value("${nts.api.service-key}")
    private String ntsServiceKey;

    /**
     * 회원가입 로직 (일반)
     */
    public Long join(Member member) {
        validateDuplicateMember(member);
        String encodedPassword = passwordEncoder.encode(member.getPassword());

        Member encryptedMember = Member.builder()
                .userId(member.getUserId())
//                .userTableId(member.getUserId())
                .password(encodedPassword)
                .name(member.getName())
                .email(member.getEmail())
                .phone(member.getPhone())
                .latitude(member.getLatitude())
                .longitude(member.getLongitude())
                .status(member.getStatus())
                .role("USER")
                .build();

        memberRepository.save(encryptedMember);
        return encryptedMember.getId();
    }

    /**
     * 상인 전용 회원가입 (QR코드 + UUID 생성 기능 추가)
     */
    public Long merchantJoin(Member member, String businessNumber, String marketName) {
        // 1. 사업자 번호 진위 확인 (국세청 API 호출)
        if (!verifyBusinessNumber(businessNumber)) {
            throw new IllegalArgumentException("유효하지 않은 사업자 번호입니다.");
        }

        // 2. 기본 정보 설정 및 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(member.getPassword());

        // 3. 상인 객체 생성
        Member merchant = Member.builder()
                .userId(member.getUserId())
//                .userTableId(member.getUserId())
                .password(encodedPassword)
                .name(member.getName())
                .email(member.getEmail())
                .businessNumber(businessNumber)
                .marketName(marketName)
                .role("MERCHANT")
                .status("ACTIVE")
                .build();

        // 4. 먼저 저장을 해서 영속성 컨텍스트에 올립니다.
        Member savedMerchant = memberRepository.save(merchant);

        // 5. QR 코드 및 UUID 생성 시작!
        try {
            // [A] 중복 없는 고유 번호 발급 (UUID)
            String uuid = UUID.randomUUID().toString();

            // [B] QR 코드에 담을 내용 조립
            String qrContent = "MERCHANT:" + savedMerchant.getUserId() + ":" + uuid;

            // [C] 이미지 파일 생성
            BufferedImage qrImage = qrCodeUtil.generateQRCodeImage(qrContent,200,200);

            // 파일 이름 규칙: merchant_아이디.png
            String fileName = "merchant_" + savedMerchant.getUserId() + ".png";
            File folder = new File(qrUploadPath);
            if (!folder.exists()) {
                folder.mkdirs(); // 폴더가 없으면 만듭니다.
            }

            File outputFile = new File(qrUploadPath + fileName);
            ImageIO.write(qrImage, "png", outputFile); // 실제 파일로 저장!

            // [D] DB에 생성된 UUID와 경로 업데이트
            savedMerchant.updateQrInfo(uuid, "/uploads/qr/" + fileName);

        } catch (Exception e) {
            // QR 생성 중 문제 발생 시 가입 자체를 취소(Rollback)합니다.
            throw new RuntimeException("상인 가입 중 QR코드 생성에 실패했습니다.", e);
        }

        return savedMerchant.getId();
    }

    /**
     * 로그인 로직 (ara 수정)
     */
//    public Member login(String userId, String password) {
//        Member member = memberRepository.findByUserId(userId)
//                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));
//
//        if (!passwordEncoder.matches(password, member.getPassword())) {
//            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
//        }
//        return member;
//    }
    public Map<String, String> login(String userId, String password) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        if (!passwordEncoder.matches(password, member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // Spring Security 인증 객체 생성
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                member.getUserId(), "",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + member.getRole()))
        );

        // 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String refreshToken = jwtTokenProvider.createRefreshToken(authentication);

        // Redis에 Refresh Token 저장 (기존 토큰 있으면 덮어쓰기)
        refreshTokenRepository.save(new RefreshToken(member.getUserId(), refreshToken));

        // 클라이언트에 전달할 응답 구성
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        tokens.put("name", member.getName());
        tokens.put("role", member.getRole());

        return tokens;
    }

    /**
     * 회원 탈퇴 로직
     */
    public void withdraw(String userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        memberRepository.delete(member);
    }

    private void validateDuplicateMember(Member member) {
        memberRepository.findByUserId(member.getUserId())
                .ifPresent(m -> {
                    throw new IllegalStateException("이미 존재하는 아이디입니다.");
                });
    }

    /**
     * 아이디 찾기 로직 (일반 유저)
     */
    public String findUserId(String name, String email) {
        Member member = memberRepository.findByNameAndEmail(name, email)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보가 없습니다."));
        return member.getUserId();
    }

    /**
     * 비밀번호 재설정 로직
     */
    public void resetPassword(PasswordResetRequestDto request) {
        Member member = memberRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        if (!member.getName().equals(request.getName())) {
            throw new IllegalArgumentException("입력하신 이름 정보가 일치하지 않습니다.");
        }

        if ("MERCHANT".equals(member.getRole())) {
            if (request.getBusinessNumber() == null || !request.getBusinessNumber().equals(member.getBusinessNumber())) {
                throw new IllegalArgumentException("사업자 번호 정보가 일치하지 않습니다.");
            }
        } else {
            if (request.getEmail() == null || !request.getEmail().equals(member.getEmail())) {
                throw new IllegalArgumentException("이메일 정보가 일치하지 않습니다.");
            }
        }

        member.setPassword(passwordEncoder.encode(request.getNewPassword()));
        memberRepository.save(member);
    }

    /**
     * 사업자 번호 진위 확인 로직
     */
    public boolean verifyBusinessNumber(String businessNumber) {

        String url = "https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=" + ntsServiceKey;

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("b_no", Collections.singletonList(businessNumber));

        try {
            BusinessVerifyResponseDto response = restTemplate.postForObject(url, requestBody, BusinessVerifyResponseDto.class);
            if (response != null && !response.getData().isEmpty()) {
                String status = response.getData().get(0).getB_stt();
                return "계속사업자".equals(status);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("국세청 서비스 점검 중이거나 키가 잘못되었습니다.");
        }
        return false;
    }

    /**
     * 상인 전용 아이디 찾기
     */
    public String findMerchantId(String name, String businessNumber) {
        Member member = memberRepository.findByNameAndBusinessNumber(name, businessNumber)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 사장님 정보가 없습니다."));
        return member.getUserId();
    }

    /**
     * 스탬프 적립하기
     */
    @Transactional
    public void addStamp(String userId, String marketName) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Stamp stamp = stampRepository.findByMemberAndMarketName(member, marketName)
                .orElseGet(() -> Stamp.builder()
                        .member(member)
                        .userTableId(member.getUserId())
                        .marketName(marketName)
                        .count(0)
                        .status("ACTIVE")
                        .build());

        stamp.addStamp();
        stampRepository.save(stamp);
    }

    /**
     * 내 스탬프 목록 조회
     */
    public List<Stamp> getMyStamps(String userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        return stampRepository.findByMember(member);
    }
}
