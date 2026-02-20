package portfolio.studytube.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import portfolio.studytube.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
}
