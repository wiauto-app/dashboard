import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import {
  ArrowUp,
  FileText,
  Loader2,
  Mic,
  Paperclip,
  Square,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { filesService } from "@/services/files/filesService";
import { chatService } from "./services/chatService";
import { CHAT_MESSAGE_TYPE, type ChatMessageListItem, type ChatMessageType } from "./types/chat.types";

type UploadStatus = "pending" | "uploading" | "complete" | "error";

interface AttachedFile {
  id: string;
  file: File;
  preview: string | null;
  upload_status: UploadStatus;
  message_type: ChatMessageType;
}

export type ComposerSendPayload = {
  type: ChatMessageType;
  content: string;
  metadata?: {
    file_name?: string;
    mime_type?: string;
    file_size_bytes?: number;
    duration_seconds?: number;
    caption?: string;
  };
};

interface ChatMessageComposerProps {
  chat_id: string;
  disabled?: boolean;
  onSend?: (payload: ComposerSendPayload) => Promise<void>;
  onMessageSent?: (message: ChatMessageListItem) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

const resolveMessageType = (file: File): ChatMessageType => {
  const type = file.type.toLowerCase();
  if (type.startsWith("image/")) return CHAT_MESSAGE_TYPE.IMAGE;
  if (type.startsWith("audio/")) return CHAT_MESSAGE_TYPE.AUDIO;
  return CHAT_MESSAGE_TYPE.FILE;
};


export const ChatMessageComposer = ({
  chat_id,
  disabled = false,
  onSend,
  onMessageSent,
  onTypingStart,
  onTypingStop,
}: ChatMessageComposerProps): ReactElement => {
  const send_message = async (payload: ComposerSendPayload) => {
    if (onSend) {
      await onSend(payload);
      return;
    }
    const message = await chatService.sendMessage(chat_id, {
      content: payload.content,
      type: payload.type,
      metadata: payload.metadata,
    });
    onMessageSent?.(message);
  };
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [is_dragging, setIsDragging] = useState(false);
  const [is_sending, setIsSending] = useState(false);
  const [is_recording, setIsRecording] = useState(false);
  const [recording_seconds, setRecordingSeconds] = useState(0);

  const textarea_ref = useRef<HTMLTextAreaElement>(null);
  const file_input_ref = useRef<HTMLInputElement>(null);
  const media_recorder_ref = useRef<MediaRecorder | null>(null);
  const audio_chunks_ref = useRef<Blob[]>([]);
  const recording_timer_ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!textarea_ref.current) return;
    textarea_ref.current.style.height = "auto";
    textarea_ref.current.style.height = `${Math.min(textarea_ref.current.scrollHeight, 160)}px`;
  }, [message]);

  useEffect(() => {
    return () => {
      if (recording_timer_ref.current) clearInterval(recording_timer_ref.current);
      media_recorder_ref.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const uploadAttachment = async (file: File): Promise<string | null> => {
    void chat_id;
    const result = await filesService.uploadChatAttachment(file);
    return result.path;
  };

  const handleFiles = useCallback((incoming: FileList | File[]) => {
    const mapped = Array.from(incoming).map((file) => {
      const is_image = file.type.startsWith("image/");
      return {
        id: crypto.randomUUID(),
        file,
        preview: is_image ? URL.createObjectURL(file) : null,
        upload_status: "pending" as const,
        message_type: resolveMessageType(file),
      };
    });
    setFiles((prev) => [...prev, ...mapped]);
  }, []);

  const handleSend = async () => {
    if (disabled || is_sending) return;

    const trimmed = message.trim();
    const has_text = trimmed.length > 0;
    const has_files = files.length > 0;
    if (!has_text && !has_files) return;

    setIsSending(true);
    onTypingStop?.();

    try {
      if (has_files) {
        for (const [index, attachment] of files.entries()) {
          setFiles((prev) =>
            prev.map((item) =>
              item.id === attachment.id ? { ...item, upload_status: "uploading" } : item,
            ),
          );
          const storage_path = await uploadAttachment(attachment.file);
          if (!storage_path) {
            setFiles((prev) =>
              prev.map((item) =>
                item.id === attachment.id ? { ...item, upload_status: "error" } : item,
              ),
            );
            continue;
          }
          await send_message({
            type: attachment.message_type,
            content: storage_path,
            metadata: {
              file_name: attachment.file.name,
              mime_type: attachment.file.type || undefined,
              file_size_bytes: attachment.file.size,
              caption: has_text && index === files.length - 1 ? trimmed : undefined,
            },
          });
        }
        if (has_text && files.length > 1) {
          await send_message({ type: CHAT_MESSAGE_TYPE.TEXT, content: trimmed });
        }
      } else if (has_text) {
        await send_message({ type: CHAT_MESSAGE_TYPE.TEXT, content: trimmed });
      }

      setMessage("");
      setFiles([]);
      if (textarea_ref.current) textarea_ref.current.style.height = "auto";
    } finally {
      setIsSending(false);
    }
  };

  const handleStartRecording = async () => {
    if (disabled || is_recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audio_chunks_ref.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audio_chunks_ref.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audio_chunks_ref.current, { type: "audio/webm" });
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: "audio/webm" });
        setIsSending(true);
        try {
          const storage_path = await uploadAttachment(file);
          if (storage_path) {
            await send_message({
              type: CHAT_MESSAGE_TYPE.AUDIO,
              content: storage_path,
              metadata: {
                file_name: file.name,
                mime_type: "audio/webm",
                file_size_bytes: file.size,
                duration_seconds: recording_seconds,
              },
            });
          }
        } finally {
          setIsSending(false);
          setRecordingSeconds(0);
        }
      };
      media_recorder_ref.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recording_timer_ref.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      toast.error("No se pudo acceder al micrófono");
    }
  };

  const handleStopRecording = () => {
    if (!media_recorder_ref.current || !is_recording) return;
    media_recorder_ref.current.stop();
    setIsRecording(false);
    if (recording_timer_ref.current) {
      clearInterval(recording_timer_ref.current);
      recording_timer_ref.current = null;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);
    if (value.trim()) onTypingStart?.();
    else onTypingStop?.();
  };

  const has_content = message.trim().length > 0 || files.length > 0;

  return (
    <div
      className="relative w-full"
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files.length > 0) {
          handleFiles(event.dataTransfer.files);
        }
      }}
    >
      <div
        className={cn(
          "flex flex-col gap-2 rounded-xl border bg-background p-3 shadow-sm",
          is_dragging && "border-primary ring-2 ring-primary/20",
        )}
      >
        {files.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {files.map((file) => (
              <div
                key={file.id}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted"
              >
                {file.preview ? (
                  <img src={file.preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col justify-between p-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="truncate text-[10px]">{file.file.name}</span>
                  </div>
                )}
                {file.upload_status === "uploading" ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="size-4 animate-spin text-white" />
                  </div>
                ) : null}
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white"
                  onClick={() => setFiles((prev) => prev.filter((item) => item.id !== file.id))}
                  aria-label="Quitar adjunto"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {is_recording ? (
          <div className="flex items-center justify-between rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <span>Grabando… {recording_seconds}s</span>
            <button
              type="button"
              onClick={handleStopRecording}
              className="inline-flex items-center gap-1 rounded-md bg-destructive px-2 py-1 text-xs text-white"
            >
              <Square className="size-3" />
              Detener
            </button>
          </div>
        ) : (
          <textarea
            ref={textarea_ref}
            value={message}
            disabled={disabled || is_sending}
            onChange={(event) => handleChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={(event) => {
              const pasted_files = Array.from(event.clipboardData.files);
              if (pasted_files.length > 0) {
                event.preventDefault();
                handleFiles(pasted_files);
              }
            }}
            placeholder="Escribe un mensaje…"
            rows={1}
            className="max-h-40 min-h-[2.5rem] w-full resize-none bg-transparent text-sm outline-none"
          />
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={disabled || is_sending || is_recording}
              onClick={() => file_input_ref.current?.click()}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Adjuntar archivo"
            >
              <Paperclip className="size-4" />
            </button>
            <button
              type="button"
              disabled={disabled || is_sending}
              onClick={is_recording ? handleStopRecording : handleStartRecording}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-lg",
                is_recording
                  ? "bg-destructive text-white"
                  : "text-muted-foreground hover:bg-muted",
              )}
              aria-label={is_recording ? "Detener grabación" : "Grabar audio"}
            >
              <Mic className="size-4" />
            </button>
          </div>
          <button
            type="button"
            disabled={!has_content || disabled || is_sending || is_recording}
            onClick={() => void handleSend()}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-lg",
              has_content ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
            aria-label="Enviar mensaje"
          >
            {is_sending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </button>
        </div>
      </div>

      <input
        ref={file_input_ref}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
};
