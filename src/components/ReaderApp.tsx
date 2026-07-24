"use client";

import {
  BookOpen, ChevronRight, Clock3, Grid2X2, Highlighter, Home, Library,
  List, Menu, MoreHorizontal, Plus, Search, Settings2, Upload, X,
} from "lucide-react";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import ReflowReader from "./ReflowReader";

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
    return <ReflowReader book={activeBook} onClose={() => setActiveBook(null)} />;
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
