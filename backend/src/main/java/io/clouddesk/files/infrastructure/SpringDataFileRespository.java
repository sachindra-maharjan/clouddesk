package io.clouddesk.files.infrastructure;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataFileRespository
        extends JpaRepository<JpaFileEntity, UUID>, JpaSpecificationExecutor<JpaFileEntity> {

    @Query("select coalesce(sum(f.sizeBytes), 0) from JpaFileEntity f")
    long sumSizeBytes();

    List<JpaFileEntity> findByUploadedAtGreaterThanEqual(Instant since);
}
