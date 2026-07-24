"use client";

import dynamic from "next/dynamic";

const ReaderApp = dynamic(() => import("./ReaderApp"), {
  ssr: false,
  loading: () => (
    <main className="app-loading">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <p>Opening your reading space…</p>
    </main>
  ),
});

export default function ReaderShell() {
  return <ReaderApp />;
}
