package market_it.pleegie.common.security;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.admin.entity.Admin;
import market_it.pleegie.admin.repository.AdminRepository;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.user.entity.User;
import market_it.pleegie.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    // 일반 로그인 (loginId로 조회)
    @Override
    public UserDetails loadUserByUsername(String loginId)
            throws UsernameNotFoundException {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));
        return new CustomUserDetails(user);
    }

    // JWT 필터에서 사용 (userId로 조회)
    public UserDetails loadUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));
        return new CustomUserDetails(user);
    }

    public UserDetails loadAdminById(Long adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));
        return new CustomAdminDetails(admin);
    }
}