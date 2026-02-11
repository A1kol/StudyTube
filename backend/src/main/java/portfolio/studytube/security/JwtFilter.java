package portfolio.studytube.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Берем заголовок Authorization
        String authHeader = request.getHeader("Authorization");

        // 2. Если токена нет или он не начинается с Bearer — пропускаем запрос дальше (может это регистрация?)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Вырезаем сам токен из строки "Bearer <token>"
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);

        // 4. Если имя есть и юзер еще не авторизован в этой сессии
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtService.isTokenValid(token)) {
                // Создаем "пропуск" для Spring Security
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, Collections.emptyList()
                );
                // Кладем его в контекст (теперь юзер залогинен на время этого запроса)
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 5. Идем дальше по цепочке
        filterChain.doFilter(request, response);
    }
}