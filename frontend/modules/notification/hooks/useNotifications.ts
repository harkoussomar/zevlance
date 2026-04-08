import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';

export const NOTIFICATIONS_KEY  = ['notifications'] as const;
export const UNREAD_COUNT_KEY   = ['notifications', 'unread-count'] as const;

/** Poll unread count every 30 s — used by the bell badge */
export function useUnreadCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn:  notificationService.getUnreadCount,
    refetchInterval: 30_000,
    select: (data) => data.count,
  });
}

/** Fetch full list — called only when dropdown is open */
export function useNotifications(enabled: boolean) {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn:  () => notificationService.getNotifications(),
    enabled,
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      qc.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      qc.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}