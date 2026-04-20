package market_it.pleegie.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.LocalDateTime;

@MappedSuperclass// 실제 테이블로 생성되지 않고 자식 엔티티들에게 필드만 상속해줌
@EntityListeners(AuditingEntityListener.class)// 데이터 변화를 감시하여 날짜를 자동 기입
@Data
public abstract class BaseEntity {
    @CreatedDate// 데이터 생성 시점 자동 저장
    @Column(updatable = false)// 수정 시에는 이 필드를 건드리지 않음
    private LocalDateTime createdAt;

    @LastModifiedDate// 데이터 수정 시점 자동 저장
    private LocalDateTime updatedAt;
}
