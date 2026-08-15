import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {

    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onCancel();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onCancel]);

    if (!open) {
        return null;
    }

    return createPortal(
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 999999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                background: "rgba(4, 24, 32, 0.58)",
            }}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                onMouseDown={(event) => event.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: "470px",
                    background: "#ffffff",
                    borderRadius: "22px",
                    padding: "30px",
                    border: "1px solid rgba(15, 49, 61, 0.10)",
                    boxShadow: "0 28px 80px rgba(3, 25, 35, 0.30)",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "20px",
                        fontSize: "24px",
                        fontWeight: 800,
                        color: danger ? "#dc2626" : "#079455",
                        background: danger ? "#fff1f1" : "#eafaf2",
                    }}
                >
                    {danger ? "!" : "✓"}
                </div>

                <h2
                    style={{
                        margin: 0,
                        color: "#102f3a",
                        fontSize: "24px",
                        fontWeight: 800,
                    }}
                >
                    {title}
                </h2>

                <p
                    style={{
                        margin: "12px 0 28px",
                        color: "#607683",
                        fontSize: "16px",
                        lineHeight: 1.6,
                    }}
                >
                    {message}
                </p>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                    }}
                >
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            minWidth: "105px",
                            height: "46px",
                            borderRadius: "10px",
                            border: "1px solid #cad7dc",
                            background: "#ffffff",
                            color: "#183640",
                            fontSize: "15px",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={() => void onConfirm()}
                        style={{
                            minWidth: "105px",
                            height: "46px",
                            borderRadius: "10px",
                            border: "none",
                            background: danger ? "#e32626" : "#079455",
                            color: "#ffffff",
                            fontSize: "15px",
                            fontWeight: 800,
                            cursor: "pointer",
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}