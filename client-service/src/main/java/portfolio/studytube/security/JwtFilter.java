package portfolio.studytube.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;
import portfolio.studytube.exception.InvalidTokenException;
import portfolio.studytube.user.entity.User;

import java.io.IOException;
import java.util.Collections;
import java.util.Date;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final HandlerExceptionResolver handlerExceptionResolver;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                filterChain.doFilter(request, response);
                return;
            }

            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Claims claims = jwtService.extractAllClaims(token);

                if (claims.getExpiration().after(new Date())) {
                    String userMail = claims.get("mail", String.class);
                    String userName = claims.getSubject();
                    Long userId = claims.get("id", Long.class);

                    if (userMail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        // Собираем объект пользователя из токена
                        User userPrincipal = User.builder()
                                .id(userId)
                                .name(userName)
                                .mail(userMail)
                                .build();

                        // ВАЖНО: Используем конструктор с 3 параметрами (включая пустой список ролей),
                        // чтобы Spring пометил аутентификацию как успешную (isAuthenticated = true)
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userPrincipal,
                                null,
                                Collections.emptyList()
                        );

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.debug("User {} authenticated via JWT", userMail);
                    }
                } else {
                    log.warn("JWT Token expired");
                    throw new InvalidTokenException("TOKEN_EXPIRED");
                }
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("JWT Filter error: {}", e.getMessage());
            handlerExceptionResolver.resolveException(request, response, null, e);
        }
    }
}