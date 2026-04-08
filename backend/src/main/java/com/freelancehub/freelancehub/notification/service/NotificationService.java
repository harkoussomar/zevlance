package com.freelancehub.freelancehub.notification.service;

import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.notification.domain.Notification;
import com.freelancehub.freelancehub.notification.domain.NotificationType;
import com.freelancehub.freelancehub.notification.dto.NotificationResponse;
import com.freelancehub.freelancehub.notification.dto.UnreadCountResponse;
import com.freelancehub.freelancehub.notification.repository.NotificationRepository;
import com.freelancehub.freelancehub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // ── In-app only ────────────────────────────────────────────────────────

    public void notify(String userId, NotificationType type, String title, String message,
                       String referenceId, String referenceType) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setReferenceId(referenceId);
        n.setReferenceType(referenceType);
        notificationRepository.save(n);
        log.debug("Notification saved → user:{} type:{}", userId, type);
    }

    // ── In-app + email ─────────────────────────────────────────────────────

    public void notifyWithEmail(String userId, NotificationType type, String title,
                                String message, String referenceId, String referenceType,
                                String emailSubject, String emailHtml) {
        notify(userId, type, title, message, referenceId, referenceType);
        userRepository.findById(userId).ifPresent(user ->
                emailService.send(user.getEmail(), emailSubject, emailHtml));
    }

    // ── Email only (auth flows) ────────────────────────────────────────────

    public void sendEmailOnly(String email, String subject, String html) {
        emailService.send(email, subject, html);
    }

    // ── Read operations ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(String userId, Pageable pageable) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(String userId) {
        return new UnreadCountResponse(notificationRepository.countByUserIdAndReadFalse(userId));
    }

    @Transactional
    public void markAsRead(String notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (!n.getUserId().equals(userId))
                throw new UnauthorizedException("Not your notification");
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsRead(userId);
    }

    // ── Mapping ────────────────────────────────────────────────────────────

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getTitle(),
                n.getMessage(), n.isRead(), n.getReferenceId(), n.getReferenceType(), n.getCreatedAt());
    }
}