package io.clouddesk.files.infrastructure;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataFileRespository
        extends JpaRepository<JpaFileEntity, UUID>, JpaSpecificationExecutor<JpaFileEntity> {

}
