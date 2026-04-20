package market_it.pleegie.repository;

import market_it.pleegie.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository(리포지토리)는 DB에 접근하는 기술입니다.
 * 비유: 장부를 쓰고 읽는 '전용 펜'이자 '창고지기' 역할을 합니다.
 */
public interface MemberRepository extends JpaRepository<Member, Long> {

    // 아이디로 회원을 찾는 기능을 추가합니다. (나중에 로그인/중복체크 시 사용)
    Optional<Member> findByUserId(String userId);
    // [추가] 이름과 이메일로 회원 정보를 찾는 도구
    Optional<Member> findByNameAndEmail(String name, String email);
    // 이름과 사업자 번호로 회원을 찾는 기능 (상인 전용 아이디 찾기용)
    Optional<Member> findByNameAndBusinessNumber(String name, String businessNumber);
}