import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface LoginCardProps {
    children: ReactNode;
    title: ReactNode;
    subtitle: string;
    error?: string | null;
}

export function LoginCard({ children, title, subtitle, error }: LoginCardProps) {
    const { t } = useTranslation("auth");

    return (
        <div className="login-card-wrapper">
            <div className="login-card">
                <div className="login-card-content">
                    <div className="login-header">
                        <h1 className="login-title">{title}</h1>
                        <p className="login-subtitle">{subtitle}</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="flex-shrink-0">
                                <path
                                    d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM8 9C7.44772 9 7 8.55228 7 8V4C7 3.44772 7.44772 3 8 3C8.55228 3 9 3.44772 9 4V8C9 8.55228 8.55228 9 8 9ZM9 12C9 12.5523 8.55228 13 8 13C7.44772 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11C8.55228 11 9 11.4477 9 12Z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="login-buttons">{children}</div>

                    <p className="login-footer-note">{t("login.footerNote")}</p>
                </div>
            </div>
        </div>
    );
}
