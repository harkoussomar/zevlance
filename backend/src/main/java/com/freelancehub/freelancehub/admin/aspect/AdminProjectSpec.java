package com.freelancehub.freelancehub.admin.aspect;

import com.freelancehub.freelancehub.admin.dto.AdminProjectFilter;
import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class AdminProjectSpec {

    public static Specification<Project> forFilter(AdminProjectFilter f) {
        return Specification
                .where(notDeleted())
                .and(hasStatus(f.status()))
                .and(hasClient(f.clientId()))
                .and(hasCategory(f.category()))
                .and(isFlagged(f.flagged()))
                .and(isFeatured(f.featured()))
                .and(createdAfter(f.startDate()))
                .and(createdBefore(f.endDate()))
                .and(titleContains(f.search()));
    }

    private static Specification<Project> notDeleted() {
        return (root, q, cb) -> cb.isNull(root.get("deletedAt"));
    }

    private static Specification<Project> hasStatus(ProjectStatus status) {
        return (root, q, cb) -> status == null
                ? null
                : cb.equal(root.get("status"), status);
    }

    private static Specification<Project> hasClient(String clientId) {
        return (root, q, cb) -> clientId == null
                ? null
                : cb.equal(root.get("client").get("id"), clientId);
    }

    private static Specification<Project> hasCategory(ProjectCategory category) {
        return (root, q, cb) -> category == null
                ? null
                : cb.equal(root.get("category"), category);
    }

    private static Specification<Project> isFlagged(Boolean flagged) {
        return (root, q, cb) -> flagged == null
                ? null
                : cb.equal(root.get("flagged"), flagged);
    }

    private static Specification<Project> isFeatured(Boolean featured) {
        return (root, q, cb) -> featured == null
                ? null
                : cb.equal(root.get("featured"), featured);
    }

    private static Specification<Project> createdAfter(LocalDate startDate) {
        return (root, q, cb) -> startDate == null
                ? null
                : cb.greaterThanOrEqualTo(root.get("createdAt").as(LocalDate.class), startDate);
    }

    private static Specification<Project> createdBefore(LocalDate endDate) {
        return (root, q, cb) -> endDate == null
                ? null
                : cb.lessThanOrEqualTo(root.get("createdAt").as(LocalDate.class), endDate);
    }

    private static Specification<Project> titleContains(String search) {
        return (root, q, cb) -> search == null || search.isBlank()
                ? null
                : cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%");
    }
}