package market_it.pleegie.repository;

import market_it.pleegie.domain.Member;
import market_it.pleegie.domain.Stamp;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * StampRepository는 도장 장부(Stamp 테이블)에 접근하는 창고지기입니다.
 */
public interface StampRepository extends JpaRepository<Stamp, Long> {

    // 1. 특정 회원의 모든 도장판 목록을 가져오는 기능
    List<Stamp> findByMember(Member member);

    // 2. 특정 회원과 특정 가게의 도장판이 이미 있는지 찾는 기능
    Optional<Stamp> findByMemberAndMarketName(Member member, String marketName);
}