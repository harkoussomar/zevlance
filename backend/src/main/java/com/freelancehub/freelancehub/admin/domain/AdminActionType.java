package com.freelancehub.freelancehub.admin.domain;

public enum AdminActionType {

    // ── User actions ──────────────────────────────────────────────────────────
    SUSPEND_USER,
    ACTIVATE_USER,
    DELETE_USER,

    // ── Project actions ───────────────────────────────────────────────────────
    DELETE_PROJECT,
    CHANGE_PROJECT_STATUS,
    FLAG_PROJECT,
    UNFLAG_PROJECT,
    FEATURE_PROJECT,
    UNFEATURE_PROJECT,
    UPDATE_PROJECT_NOTE
}