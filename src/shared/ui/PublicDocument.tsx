import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./PublicDocument.css";

export function PublicDocument({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <main className={`public-document ${className}`}>
      <header className="public-document-header">
        <Link to="/">KHANZAMA</Link>
        <span>AR живые фотографии</span>
        <small>Просмотр по ссылке или QR</small>
      </header>
      {children}
    </main>
  );
}
