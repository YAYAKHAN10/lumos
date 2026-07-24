"use client";

import {
  ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Clock3, Grid2X2,
  Highlighter, Home, Library, List, Maximize2, Menu, Minus, Moon,
  MoreHorizontal, Plus, Search, Settings2, Sun, Upload, X,
} from "lucide-react";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type Book = {
  id: string;
  title: string;
  size: string;
  url: string;
  progress: number;
};

const starterBooks: Book[] = [
  { id: "welcome", title: "The quiet art of reading", size: "A short introduction", url: "", progress: 64 },
  { id: "guide", title: "Your personal library", size: "Reader guide", url: "", progress: 18 },
];

const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>;
}

export default function ReaderApp() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [books, setBooks] = useState<Book[]>(starterBooks);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addFiles = (files: FileList | File[]) => {
    const next = Array.from(files)
      .filter((file) => file.type === "application/pdf")
      .map((file) => ({
        id: crypto.randomUUID(),
        title: file.name.replace(/\.pdf$/i, ""),
        size: formatBytes(file.size),
        url: URL.createObjectURL(file),
        progress: 0,
      }));
    if (!next.length) return;
    setBooks((current) => [...next, ...current]);
    setActiveBook(next[0]);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (activeBook?.url) {
    return <PdfReader book={activeBook} onClose={() => setActiveBook(null)} />;
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="sidebar-top">
          <a className="brand" href="#" aria-label="Luma Reader home"><BrandMark /><span>Luma</span></a>
          <button className="mobile-close icon-button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          <button className="nav-item active"><Home size={19} /> Home</button>
          <button className="nav-item"><Library size={19} /> My library <span className="nav-count">{books.length}</span></button>
          <button className="nav-item"><Clock3 size={19} /> Recent</button>
          <button className="nav-item"><Highlighter size={19} /> Highlights</button>
        </nav>
        <div className="sidebar-spacer" />
        <div className="storage">
          <div className="storage-title"><span>Local library</span><span>Private</span></div>
          <div className="storage-track"><span style={{ width: `${Math.min(90, books.length * 5 + 8)}%` }} /></div>
          <p>Your books stay on this device.</p>
        </div>
        <button className="profile">
          <span className="avatar">YK</span>
          <span><strong>Your library</strong><small>Personal space</small></span>
          <MoreHorizontal size={18} />
        </button>
      </aside>

      {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}

      <section
        className="library-view"
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }}
        onDrop={onDrop}
      >
        <header className="topbar">
          <button className="menu-button icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <label className="search-box">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your library" />
            <kbd>⌘ K</kbd>
          </label>
          <button className="icon-button settings-button" aria-label="Settings"><Settings2 size={19} /></button>
          <button className="upload-button" onClick={() => inputRef.current?.click()}><Plus size={18} /><span>Add a book</span></button>
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={onFileChange} />
        </header>

        <div className="library-content">
          <section className="hero">
            <div>
              <span className="eyebrow">YOUR READING SPACE</span>
              <h1>Good afternoon.</h1>
              <p>Pick up where you left off, or add something new.</p>
            </div>
            <div className="hero-orbit" aria-hidden="true"><span className="orbit-ring" /><BrandMark /></div>
          </section>

          <section className="continue-section">
            <div className="section-heading">
              <div><p className="section-kicker">CONTINUE READING</p><h2>A moment of quiet, waiting for you.</h2></div>
              <button className="text-button">View all <ChevronRight size={15} /></button>
            </div>
            <article className="continue-card">
              <div className="book-cover featured"><span className="cover-mark">L</span><small>THE QUIET ART</small><strong>OF<br />READING</strong><i /></div>
              <div className="continue-copy">
                <span className="reading-label"><BookOpen size={14} /> READING NOW</span>
                <h3>The quiet art of reading</h3>
                <p>A small guide to making more room for ideas, attention, and the pleasure of turning one page at a time.</p>
                <div className="progress-row"><div><span style={{ width: "64%" }} /></div><small>64%</small></div>
                <button className="primary-button" onClick={() => inputRef.current?.click()}>Open a PDF <Upload size={16} /></button>
              </div>
              <div className="quote"><span>“</span><p>Reading is an invitation to be elsewhere, without leaving.</p></div>
            </article>
          </section>

          <section className="books-section">
            <div className="section-heading books-heading">
              <div><p className="section-kicker">YOUR BOOKS</p><h2>Library</h2></div>
              <div className="view-switch" aria-label="Change book view">
                <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={17} /></button>
                <button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="List view"><List size={18} /></button>
              </div>
            </div>
            <div className={`book-grid ${view === "list" ? "list-view" : ""}`}>
              <button className="add-card" onClick={() => inputRef.current?.click()}><span><Upload size={23} /></span><strong>Add a PDF</strong><small>Drop it here or browse</small></button>
              {filteredBooks.map((book, index) => (
                <button className="book-card" key={book.id} onClick={() => book.url ? setActiveBook(book) : inputRef.current?.click()}>
                  <div className={`book-cover palette-${index % 4}`}><span className="cover-mark">{book.title.charAt(0)}</span><small>LUMA EDITION</small><strong>{book.title}</strong><i /></div>
                  <div className="book-meta"><strong>{book.title}</strong><span>{book.size}</span><div className="mini-progress"><span style={{ width: `${book.progress}%` }} /></div></div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {dragging && <div className="drop-overlay"><div><Upload size={30} /><strong>Drop your PDFs here</strong><span>They’ll be ready to read in a moment.</span></div></div>}
      </section>
    </main>
  );
}

function PdfReader({ book, onClose }: { book: Book; onClose: () => void }) {
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [tone, setTone] = useState<"light" | "sepia" | "dark">("light");
  const [panelOpen, setPanelOpen] = useState(false);
  const previousPage = () => setPage((current) => Math.max(1, current - 1));
  const nextPage = () => setPage((current) => Math.min(pages || current, current + 1));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") previousPage();
      if (event.key === "ArrowRight") nextPage();
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <main className={`reader tone-${tone}`}>
      <header className="reader-bar">
        <div className="reader-title">
          <button className="reader-icon" onClick={onClose} aria-label="Back to library"><ArrowLeft size={20} /></button>
          <BrandMark />
          <span><strong>{book.title}</strong><small>{pages ? `${pages} pages` : "Opening document…"}</small></span>
        </div>
        <div className="reader-actions">
          <button className="reader-icon" onClick={() => setPanelOpen(!panelOpen)} aria-label="Reader appearance"><Sun size={19} /></button>
          <button className="reader-icon" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Enter fullscreen"><Maximize2 size={18} /></button>
        </div>
      </header>

      <aside className={`appearance-panel ${panelOpen ? "open" : ""}`}>
        <div className="panel-heading"><strong>Reading appearance</strong><button onClick={() => setPanelOpen(false)}><X size={18} /></button></div>
        <span>Page tone</span>
        <div className="tone-options">
          <button className={tone === "light" ? "active" : ""} onClick={() => setTone("light")}><Sun size={17} /> Light</button>
          <button className={tone === "sepia" ? "active" : ""} onClick={() => setTone("sepia")}><BookOpen size={17} /> Warm</button>
          <button className={tone === "dark" ? "active" : ""} onClick={() => setTone("dark")}><Moon size={17} /> Dark</button>
        </div>
      </aside>

      <section className="document-stage">
        <Document file={book.url} onLoadSuccess={({ numPages }) => setPages(numPages)} loading={<div className="reader-loading"><BrandMark /><span>Preparing your book…</span></div>} error={<div className="reader-loading error"><strong>We couldn’t open this PDF.</strong><span>Try another document.</span></div>}>
          <div className="page-wrap"><Page pageNumber={page} scale={scale} renderAnnotationLayer renderTextLayer loading={<div className="page-placeholder" />} /></div>
        </Document>
      </section>

      <footer className="reader-controls">
        <div className="zoom-controls">
          <button onClick={() => setScale((value) => Math.max(0.6, value - 0.15))} aria-label="Zoom out"><Minus size={17} /></button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((value) => Math.min(2.5, value + 0.15))} aria-label="Zoom in"><Plus size={17} /></button>
        </div>
        <div className="page-controls">
          <button onClick={previousPage} disabled={page <= 1} aria-label="Previous page"><ChevronLeft size={19} /></button>
          <span>Page <strong>{page}</strong> of {pages || "—"}</span>
          <button onClick={nextPage} disabled={!pages || page >= pages} aria-label="Next page"><ChevronRight size={19} /></button>
        </div>
        <div className="reader-progress"><span style={{ width: `${pages ? (page / pages) * 100 : 0}%` }} /></div>
      </footer>
    </main>
  );
}
