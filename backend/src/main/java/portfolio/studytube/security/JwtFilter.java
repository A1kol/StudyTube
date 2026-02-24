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
import portfolio.studytube.entity.User;

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

        // 1. ВАЖНО ДЛЯ CORS: Пропускаем OPTIONS запросы без проверки JWT
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // 2. Достаем заголовок
        String authHeader = request.getHeader("Authorization");

        // 3. Если заголовка нет или он не Bearer — идем дальше по цепочке
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Вырезаем токен
        String token = authHeader.substring(7);

        try {
            String username = jwtService.extractUsername(token);
            String usermail = jwtService.extractEmail(token);

            // 5. Если имя есть и в текущем потоке (SecurityContext) пусто
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // В JwtFilter.java
                if (jwtService.isTokenValid(token)) {
                    String name = jwtService.extractUsername(token); // Берем name
                    String email = jwtService.extractEmail(token);   // Берем email

                    User userPrincipal = new User();
                    userPrincipal.setName(name);
                    userPrincipal.setMail(email);
                    // Теперь у объекта заполнены оба поля!

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userPrincipal, null, Collections.emptyList()
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Если токен кривой или просрочен — просто логируем или идем дальше.
            // Spring Security сам вернет 403, так как контекст останется пустым.
            System.err.println("JWT Error: " + e.getMessage());
        }

        // 6. Обязательно передаем управление следующему фильтру
        filterChain.doFilter(request, response);
    }
}