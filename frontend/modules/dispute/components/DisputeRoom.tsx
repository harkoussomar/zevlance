"use client";
// dispute/components/DisputeRoom.tsx

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import {
  Send,
  Paperclip,
  AlertCircle,
  ShieldAlert,
  FileText,
  ExternalLink,
  FileImage,
  FileCode2,
  CheckCircle2,
  Scale,
  Clock,
  ChevronDown,
  Info,
  Trophy,
  User,
} from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import { Textarea } from "@/modules/shared/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/components/card";
import { SkeletonCard } from "@/modules/shared/components/skeleton";
import { FileUploader } from "@/modules/shared/components/FileUploader";
import { selectUserId, selectRole, useAuthStore } from "@/store/auth-store";
import { cn, formatDate } from "@/modules/shared";

import {
  useDisputeDetails,
  useSendDisputeMessage,
  useAddDisputeEvidence,
  useEscalateDispute,
  useResolveDispute,
} from "../hooks/useDispute";
import type {
  DisputeDetailsResponse,
  DisputeMessageResponse,
  DisputeOutcome,
  DisputeStatus,
} from "../types/dispute.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateHeader(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

function groupByDate(messages: DisputeMessageResponse[]) {
  const map = new Map<string, DisputeMessageResponse[]>();
  for (const msg of messages) {
    const key = format(new Date(msg.createdAt), "yyyy-MM-dd");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(msg);
  }
  return Array.from(map.entries()).map(([date, msgs]) => ({ date, msgs }));
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext ?? ""))
    return FileImage;
  if (["js", "ts", "tsx", "jsx", "json", "py", "java", "html", "css"].includes(ext ?? ""))
    return FileCode2;
  return FileText;
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────

function useCountdown(targetIso?: string) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!targetIso) return;
    const update = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) { setLabel("Deadline passed"); return; }
      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (totalHours >= 48) { setLabel(`${Math.floor(totalHours / 24)}d remaining`); return; }
      if (totalHours > 0) { setLabel(`${totalHours}h ${minutes}m remaining`); return; }
      setLabel(`${minutes}m remaining`);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [targetIso]);

  return label;
}

// ─── Status Banner ────────────────────────────────────────────────────────────

const STATUS_STEPS: { key: DisputeStatus | "REVIEW"; label: string }[] = [
  { key: "OPEN", label: "Opened" },
  { key: "ESCALATED", label: "Under Review" },
  { key: "RESOLVED", label: "Resolved" },
];

function statusToStep(status: DisputeStatus): number {
  if (status === "RESOLVED") return 2;
  if (status === "ESCALATED") return 1;
  return 0;
}

interface StatusBannerProps {
  dispute: DisputeDetailsResponse;
  canEscalate: boolean;
  escalating: boolean;
  onEscalate: () => void;
  countdown: string | null;
}

function StatusBanner({
  dispute,
  canEscalate,
  escalating,
  onEscalate,
  countdown,
}: StatusBannerProps) {
  const step = statusToStep(dispute.status);

  const bannerClass =
    dispute.status === "RESOLVED"
      ? "bg-success/8 border-success/20 text-success"
      : dispute.status === "ESCALATED"
      ? "bg-destructive/8 border-destructive/20 text-destructive"
      : "bg-warning/8 border-warning/20 text-warning";

  return (
    <div className={cn("rounded-xl border p-4 space-y-3", bannerClass)}>
      {/* Top row: icon + status text + action */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">
              {dispute.status === "RESOLVED"
                ? "Dispute Resolved"
                : dispute.status === "ESCALATED"
                ? "Under Admin Review"
                : "Dispute In Progress"}
            </p>
            <p className="text-xs opacity-80 mt-0.5 leading-relaxed">
              {dispute.status === "RESOLVED"
                ? "This dispute has been closed by administration. The ruling is final."
                : dispute.status === "ESCALATED"
                ? "An admin mediator has been assigned. You'll be notified of their decision."
                : "Funds are frozen. Use this room to communicate and upload evidence."}
            </p>
            {countdown && dispute.status === "OPEN" && (
              <p className="text-xs mt-1.5 flex items-center gap-1 opacity-70">
                <Clock className="w-3 h-3" /> Auto-escalates in {countdown}
              </p>
            )}
          </div>
        </div>
        {canEscalate && (
          <Button
            size="sm"
            variant="destructive"
            loading={escalating}
            onClick={onEscalate}
            className="shrink-0 text-xs"
          >
            Escalate to Admin
          </Button>
        )}
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-0 pt-1">
        {STATUS_STEPS.map((s, i) => {
          const isDone = i <= step;
          const isCurrent = i === step;
          return (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all text-[9px] font-bold",
                    isDone
                      ? "border-current bg-current/20"
                      : "border-current/30 bg-transparent opacity-40"
                  )}
                >
                  {isDone ? (isCurrent && dispute.status !== "RESOLVED" ? "●" : <CheckCircle2 className="w-2.5 h-2.5" />) : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium whitespace-nowrap",
                    isDone ? "opacity-100" : "opacity-40"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={cn("flex-1 h-px mx-1 mb-4 transition-all", i < step ? "bg-current/50" : "bg-current/20")} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Resolution Card ──────────────────────────────────────────────────────────

function ResolutionCard({ dispute }: { dispute: DisputeDetailsResponse }) {
  if (!dispute.ruling) return null;
  const { ruling } = dispute;

  const outcomeConfig: Record<DisputeOutcome, { icon: React.ElementType; label: string; className: string }> = {
    FREELANCER_WINS: { icon: Trophy, label: "Ruled in favor of Freelancer", className: "text-primary border-primary/20 bg-primary/8" },
    CLIENT_WINS: { icon: Trophy, label: "Ruled in favor of Client", className: "text-success border-success/20 bg-success/8" },
  };

  const { icon: Icon, label, className } = outcomeConfig[ruling.outcome];

  return (
    <Card className={cn("border", className.split(" ")[1])}>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Scale className="w-4 h-4 text-muted-foreground" />
          Admin Ruling
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className={cn("flex items-center gap-2.5 p-2.5 rounded-lg border", className)}>
          <Icon className="w-4 h-4 shrink-0" />
          <p className="text-sm font-semibold">{label}</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{ruling.explanation}</p>
        <p className="text-[10px] text-muted-foreground">
          Resolved by {ruling.adminName} · {formatDate(ruling.resolvedAt)}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Admin Ruling Panel ───────────────────────────────────────────────────────

function AdminRulingPanel({
  contractId,
  disabled,
}: {
  contractId: string;
  disabled: boolean;
}) {
  const [outcome, setOutcome] = useState<DisputeOutcome | "">("");
  const [explanation, setExplanation] = useState("");
  const { mutate: resolve, isPending } = useResolveDispute(contractId);

  const OUTCOMES: { value: DisputeOutcome; label: string; icon: React.ElementType }[] = [
    { value: "FREELANCER_WINS", icon: Trophy, label: "Freelancer wins" },
    { value: "CLIENT_WINS", icon: Trophy, label: "Client wins" },
  ];

  const canSubmit = Boolean(outcome) && explanation.trim().length >= 20 && !isPending;

  const handleResolve = () => {
    if (!outcome || !canSubmit) return;
    resolve(
      { outcome, explanation: explanation.trim() },
      {
        onSuccess: () => toast.success("Ruling issued. Dispute closed."),
        onError: (err: unknown) => toast.error((err as Error).message),
      }
    );
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
          <Scale className="w-4 h-4" />
          Issue Ruling
          <span className="ml-auto text-[10px] font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full">
            ADMIN
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-3 gap-1.5">
          {OUTCOMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setOutcome(value)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] font-medium transition-all",
                outcome === value
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/60 hover:border-border text-muted-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Explanation <span className="text-muted-foreground">(min 20 chars)</span>
          </label>
          <Textarea
            placeholder="Explain the ruling clearly and impartially, referencing the evidence provided by both parties..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={4}
            disabled={isPending || disabled}
            className="resize-none text-xs"
          />
        </div>

        <Button
          size="sm"
          className="w-full"
          disabled={!canSubmit || disabled}
          loading={isPending}
          onClick={handleResolve}
        >
          <Scale className="w-3.5 h-3.5 mr-2" />
          Issue Ruling & Close Dispute
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Dispute Info Card ────────────────────────────────────────────────────────

function DisputeInfoCard({ dispute }: { dispute: DisputeDetailsResponse }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          Dispute Details
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2.5">
        <div className="space-y-2">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
              Reason
            </p>
            <p className="text-xs text-foreground leading-relaxed">{dispute.reason}</p>
          </div>

          <div className="h-px bg-border/60" />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Filed</p>
              <p className="text-foreground font-medium">{format(new Date(dispute.createdAt), "MMM d, yyyy")}</p>
            </div>
            {dispute.escalatedAt && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Escalated</p>
                <p className="text-foreground font-medium">{format(new Date(dispute.escalatedAt), "MMM d, yyyy")}</p>
              </div>
            )}
            {dispute.resolvedAt && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Resolved</p>
                <p className="text-foreground font-medium">{format(new Date(dispute.resolvedAt), "MMM d, yyyy")}</p>
              </div>
            )}
          </div>

          {dispute.initiatorName && (
            <>
              <div className="h-px bg-border/60" />
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Filed by <span className="font-medium text-foreground">{dispute.initiatorName}</span>
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Evidence Panel ───────────────────────────────────────────────────────────

interface EvidencePanelProps {
  dispute: DisputeDetailsResponse;
  isResolved: boolean;
  onAttach: (url: string) => void;
}

function EvidencePanel({ dispute, isResolved, onAttach }: EvidencePanelProps) {
  return (
    <Card className="flex flex-col border-border/60 p-0">
      <CardHeader className="py-3 border-b shrink-0 bg-muted/20 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">
          Evidence{" "}
          {dispute.evidence.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({dispute.evidence.length})
            </span>
          )}
        </CardTitle>
        {!isResolved && (
          <FileUploader
            accept={["image/jpeg", "image/png", "image/webp", "application/pdf"]}
            onSuccess={(url: string) => onAttach(url)}
          >
            {({ open, stage, progress }) => (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs font-medium"
                disabled={["compressing", "uploading", "signing"].includes(stage)}
                onClick={open}
              >
                <Paperclip className="w-3 h-3 mr-1 text-muted-foreground" />
                {stage === "uploading" ? `${progress}%` : "Attach"}
              </Button>
            )}
          </FileUploader>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-2.5 flex-1">
        {dispute.evidence.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="w-7 h-7 mx-auto mb-2.5 text-muted-foreground/20" />
            <p className="text-xs text-muted-foreground">No evidence uploaded yet.</p>
            {!isResolved && (
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                Upload screenshots or documents to strengthen your case.
              </p>
            )}
          </div>
        ) : (
          dispute.evidence.map((ev) => {
            const FileIcon = getFileIcon(ev.fileName);
            return (
              <a
                key={ev.id}
                href={ev.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/50 hover:border-border transition-all group"
              >
                <div className="bg-primary/10 p-2 rounded-md shrink-0">
                  <FileIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-medium truncate text-foreground group-hover:text-primary transition-colors"
                    title={ev.fileName}
                  >
                    {ev.fileName}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {ev.uploaderName} · {format(new Date(ev.createdAt), "MMM d")}
                  </p>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
              </a>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// ─── Chat Message ─────────────────────────────────────────────────────────────

interface ChatMessageProps {
  msg: DisputeMessageResponse;
  isMe: boolean;
  isOptimistic: boolean;
}

function ChatMessage({ msg, isMe, isOptimistic }: ChatMessageProps) {
  const isAdmin = msg.senderRole === "ADMIN";

  if (msg.isSystemMessage) {
    return (
      <div className="flex justify-center my-3 shrink-0">
        <span className="bg-muted/80 border border-border/40 px-4 py-1.5 rounded-full text-[11px] text-muted-foreground font-medium text-center shadow-sm">
          {msg.message}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col shrink-0 gap-1", isMe ? "items-end" : "items-start")}>
      {/* Sender label */}
      <div className={cn("flex items-center gap-1.5 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
        <span className="text-xs font-semibold text-foreground">{isMe ? "You" : msg.senderName}</span>
        {isAdmin && !isMe && (
          <span className="text-[9px] font-bold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Admin
          </span>
        )}
        <span className="text-[10px] text-muted-foreground/60">
          {format(new Date(msg.createdAt), "HH:mm")}
        </span>
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "px-4 py-2.5 rounded-2xl max-w-[82%] text-sm leading-relaxed shadow-sm transition-opacity",
          isOptimistic && "opacity-60",
          isMe
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : isAdmin
            ? "bg-primary/10 text-foreground rounded-tl-sm border border-primary/20"
            : "bg-muted border border-border/60 text-foreground rounded-tl-sm"
        )}
      >
        {msg.message}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DisputeRoom({ contractId }: { contractId: string }) {
  const userId = useAuthStore(selectUserId);
  const role = useAuthStore(selectRole);
  const isAdmin = role === "ADMIN";

  const { data: dispute, isPending } = useDisputeDetails(contractId);
  const { mutate: sendMessage, isPending: sending } = useSendDisputeMessage(contractId);
  const { mutate: addEvidence } = useAddDisputeEvidence(contractId);
  const { mutate: escalate, isPending: escalating } = useEscalateDispute(contractId);

  const [message, setMessage] = useState("");
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const countdown = useCountdown(dispute?.autoEscalateAt);
  const isResolved = dispute?.status === "RESOLVED";
  const canEscalate = dispute?.status === "OPEN" && !isAdmin;

  // ─── Smart auto-scroll ─────────────────────────────────────────────────────
  // Only auto-scroll if the user is already near the bottom

  const checkScrollPosition = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScrollEnabled(distanceFromBottom < 120);
  }, []);

  useLayoutEffect(() => {
    if (autoScrollEnabled) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [dispute?.messages, autoScrollEnabled]);

  // ─── Keyboard submit: Enter = send, Shift+Enter = newline ─────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    const optimistic: DisputeMessageResponse = {
      id: `__optimistic__${Date.now()}`,
      senderId: userId ?? "__current__",
      senderName: "You",
      senderRole: role ?? "USER",
      message: trimmed,
      isSystemMessage: false,
      createdAt: new Date().toISOString(),
    };

    setMessage("");
    setAutoScrollEnabled(true);

    sendMessage(
      { message: trimmed, optimistic },
      {
        onError: () => {
          toast.error("Failed to send message. Please try again.");
          setMessage(trimmed); // Restore on error
        },
      }
    );
  };

  // ─── Evidence attach ───────────────────────────────────────────────────────

  const handleAttach = useCallback(
    (url: string) => {
      const parts = url.split("/");
      const fileWithExt = parts[parts.length - 1] || "evidence-file";
      const publicId = fileWithExt.split(".")[0] || `evidence-${Date.now()}`;
      addEvidence(
        { publicId, secureUrl: url, fileName: fileWithExt },
        { onSuccess: () => toast.success("Evidence attached successfully") }
      );
    },
    [addEvidence]
  );

  // ─── Grouped messages ─────────────────────────────────────────────────────

  const messageGroups = useMemo(
    () => groupByDate(dispute?.messages ?? []),
    [dispute?.messages]
  );

  // ─── Guard renders ─────────────────────────────────────────────────────────

  if (isPending) return <SkeletonCard />;
  if (!dispute) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <AlertCircle className="w-8 h-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Dispute not found.</p>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4">

      {/* ── Status Banner ─────────────────────────────────────────────────── */}
      <StatusBanner
        dispute={dispute}
        canEscalate={canEscalate}
        escalating={escalating}
        countdown={countdown}
        onEscalate={() =>
          escalate(undefined, {
            onSuccess: () => toast.info("Dispute escalated to admin review"),
            onError: () => toast.error("Failed to escalate. Please try again."),
          })
        }
      />

      {/* ── Main Grid ─────────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">

        {/* ── Chat Column ─────────────────────────────────────────────────── */}
        <Card className="lg:col-span-2 flex flex-col min-h-0 shadow-sm border-border/60 p-0">
          <CardHeader className="py-3 border-b shrink-0 bg-muted/20 px-4">
            <CardTitle className="text-sm font-semibold">Mediation Chat</CardTitle>
          </CardHeader>

          <CardContent
            ref={chatContainerRef}
            onScroll={checkScrollPosition}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-1 flex flex-col"
          >
            {/* Opening reason */}
            <div className="px-4 py-3 bg-muted/40 rounded-xl border border-border/50 text-xs text-center italic text-muted-foreground mx-2 shrink-0 mb-3">
              Dispute opened: &ldquo;{dispute.reason}&rdquo;
            </div>

            {/* Empty state */}
            {dispute.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center py-8">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Send className="w-4 h-4 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No messages yet.</p>
                <p className="text-xs text-muted-foreground/60">
                  Start by describing your perspective clearly and professionally.
                </p>
              </div>
            )}

            {/* Date-grouped messages */}
            {messageGroups.map(({ date, msgs }) => (
              <div key={date} className="space-y-3">
                {/* Date separator */}
                <div className="flex items-center gap-3 py-2 shrink-0">
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">
                    {getDateHeader(date)}
                  </span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                {msgs.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    msg={msg}
                    isMe={msg.senderId === userId || msg.senderId === "__current__"}
                    isOptimistic={msg.id.startsWith("__optimistic__")}
                  />
                ))}
              </div>
            ))}

            <div ref={chatEndRef} className="shrink-0 h-1" />
          </CardContent>

          {/* Scroll-to-bottom hint */}
          {!autoScrollEnabled && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
              <button
                onClick={() => {
                  setAutoScrollEnabled(true);
                  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
              >
                <ChevronDown className="w-3 h-3" />
                New messages
              </button>
            </div>
          )}

          {/* Message input */}
          {!isResolved && (
            <div className="p-3 border-t shrink-0 bg-background/80">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Type your message… (Enter to send, Shift+Enter for newline)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    rows={1}
                    className={cn(
                      "resize-none text-sm pr-14 min-h-[40px] max-h-[120px] overflow-y-auto",
                      "leading-relaxed"
                    )}
                    autoComplete="off"
                  />
                  {/* Character counter — visible when nearing limit */}
                  {message.length > 400 && (
                    <span
                      className={cn(
                        "absolute bottom-2 right-2 text-[10px] font-mono tabular-nums",
                        message.length > 480 ? "text-destructive" : "text-muted-foreground/60"
                      )}
                    >
                      {500 - message.length}
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sending || message.length > 500}
                  size="icon"
                  className="shrink-0 h-10 w-10"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ── Right Panel ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto lg:overflow-y-visible">

          {/* Admin ruling form — visible only to admins on unresolved disputes */}
          {isAdmin && !isResolved && (
            <AdminRulingPanel contractId={contractId} disabled={false} />
          )}

          {/* Resolution card — shown to everyone once resolved */}
          {isResolved && <ResolutionCard dispute={dispute} />}

          {/* Dispute metadata */}
          <DisputeInfoCard dispute={dispute} />

          {/* Evidence */}
          <EvidencePanel
            dispute={dispute}
            isResolved={isResolved ?? false}
            onAttach={handleAttach}
          />
        </div>
      </div>
    </div>
  );
}
