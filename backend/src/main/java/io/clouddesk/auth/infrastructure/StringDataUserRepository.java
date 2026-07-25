package io.clouddesk.auth.infrastructure;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StringDataUserRepository extends JpaRepository<JpaUserEntity, Long> {

    Optional<JpaUserEntity> findByEmail(String email);

}
