package io.clouddesk.files.infrastructure;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import io.clouddesk.files.domain.FileCategory;
import io.clouddesk.files.domain.FileQuery;
import io.clouddesk.files.domain.FileRepository;
import io.clouddesk.files.domain.FileVisibility;
import io.clouddesk.files.domain.SortDirection;
import io.clouddesk.files.domain.UploadedFile;
import io.clouddesk.shared.domain.PageResult;

@Service
public class FileRepositoryAdapter implements FileRepository {

    private final SpringDataFileRespository springDataFileRespository;

    public FileRepositoryAdapter(SpringDataFileRespository springDataFileRespository) {
        this.springDataFileRespository = springDataFileRespository;
    }

    @Override
    public UploadedFile save(UploadedFile file) {
        var saved = springDataFileRespository.save(toEntity(file));
        return toDomain(saved);
    }

    @Override
    public Optional<UploadedFile> findById(UUID id) {
        return springDataFileRespository.findById(id).map(this::toDomain);
    }

    @Override
    public PageResult<UploadedFile> findPage(FileQuery query) {
        Specification<JpaFileEntity> spec = visibleTo(query.requesterId())
                .and(matchingSearch(query.search()))
                .and(matchingCategory(query.fileCategory()));

        PageRequest pageRequest = PageRequest.of(query.page(), query.pageSize(), resolveSort(query));
        Page<JpaFileEntity> page = springDataFileRespository.findAll(spec, pageRequest);

        List<UploadedFile> items = page.getContent().stream().map(this::toDomain).toList();
        return new PageResult<>(items, query.page(), query.pageSize(), page.getTotalElements());
    }

    @Override
    public long countAll() {
        return springDataFileRespository.count();
    }

    @Override
    public long sumSizeBytes() {
        return springDataFileRespository.sumSizeBytes();
    }

    @Override
    public List<UploadedFile> findUploadedSince(Instant since) {
        return springDataFileRespository.findByUploadedAtGreaterThanEqual(since).stream().map(this::toDomain).toList();
    }

    private Sort resolveSort(FileQuery query) {
        if (query.sortBy() == null) {
            return Sort.by(Sort.Direction.DESC, "uploadedAt");
        }

        String property = switch (query.sortBy()) {
            case DISPLAY_NAME -> "displayName";
            case SIZE_BYTES -> "sizeBytes";
            case UPLOADED_AT -> "uploadedAt";
        };
        Sort.Direction direction = query.sortDir() == SortDirection.ASC ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, property);
    }

    private Specification<JpaFileEntity> visibleTo(UUID requesterId) {
        return (root, query, builder) -> builder.or(
                builder.equal(root.get("visibility"), FileVisibility.TEAM.name()),
                builder.equal(root.get("ownerId"), requesterId));
    }

    private Specification<JpaFileEntity> matchingSearch(String search) {
        if (search == null || search.isBlank()) {
            return (root, query, builder) -> builder.conjunction();
        }
        String pattern = "%" + search.toLowerCase() + "%";
        return (root, query, builder) -> builder.like(builder.lower(root.get("displayName")), pattern);
    }

    private Specification<JpaFileEntity> matchingCategory(FileCategory category) {
        if (category == null) {
            return (root, query, builder) -> builder.conjunction();
        }
        return (root, query, builder) -> builder.equal(root.get("category"), category.name());
    }

    private JpaFileEntity toEntity(UploadedFile file) {
        return new JpaFileEntity(
                file.id(), file.ownerId(), file.ownerName(), file.displayName(), file.originalFilename(),
                file.contentType(), file.sizeBytes(), file.storagePath(), file.category().name(),
                file.visibility().name(), file.tags(), file.notes(), file.uploadedAt());
    }

    private UploadedFile toDomain(JpaFileEntity entity) {
        return new UploadedFile(
                entity.getId(), entity.getOwnerId(), entity.getOwnerName(), entity.getDisplayName(),
                entity.getOriginalFilename(), entity.getContentType(), entity.getSizeBytes(), entity.getStoragePath(),
                FileCategory.valueOf(entity.getCategory()), FileVisibility.valueOf(entity.getVisibility()),
                entity.getTags(), entity.getNotes(), entity.getUploadedAt());
    }
}
