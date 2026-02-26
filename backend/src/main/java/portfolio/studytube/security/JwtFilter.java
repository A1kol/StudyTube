package portfolio.studytube.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
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
                response.setStatus(HttpServletResponse.SC_OK);
                return;
            }

            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(7);

            Claims claims = jwtService.extractAllClaims(token);
            String userMail = claims.get("mail", String.class);

            if (userMail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (claims.getExpiration().after(new Date())) {
                    String userName = claims.getSubject();
                    Long userId = claims.get("id", Long.class);

                    User userPrincipal = User.builder()
                            .name(userName)
                            .id(userId)
                            .mail(userMail)
                            .build();

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userPrincipal, null, Collections.emptyList()
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else throw new InvalidTokenException("TOKEN_EXPIRED");
            }


            filterChain.doFilter(request, response);
        } catch (RuntimeException e) {
            handlerExceptionResolver.resolveException(request, response, null, e);
        }
    }
}