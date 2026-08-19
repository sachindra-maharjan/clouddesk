package io.clouddesk.auth.infrastructure;

import java.util.Optional;

import org.springframework.stereotype.Service;

import io.clouddesk.auth.domain.Role;
import io.clouddesk.auth.domain.User;
import io.clouddesk.auth.domain.UserRepository;

@Service
public class UserRepositoryAdapter implements UserRepository {

    private final StringDataUserRepository repository;

    public UserRepositoryAdapter(StringDataUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public long countAll() {
        return repository.count();
    }

    private User toDomain(JpaUserEntity entity) {
        return new User(
                entity.getId(),
                entity.getEmail(),
                entity.getPasswordHash(),
                entity.getDisplayName(),
                Role.valueOf(entity.getRole()));
    }

}
