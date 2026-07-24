"use client";

import {
  ArrowLeft,
  BookOpen,
  Maximize2,
  Minus,
  Moon,
  Plus,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type ReaderBook = {
  title: string;
  url: string;
};

type ExtractedPage = {
  pageNumber: number;
  paragraphs: string[];
};

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>;
}

function linesToParagraphs(lines: string[]) {
  const paragraphs: string[] = [];
  let current = "";

  for (const line of lines) {
    const clean = line.replace(/\s+/g, " ").trim();
    if (!clean) {
      if (current) paragraphs.push(current);
      current = "";
      continue;
    }

    current = current ? `${current} ${clean}` : clean;
    const naturalEnd = /[.!?]["')\]]?$/.test(clean);
    if ((naturalEnd && current.length > 110) || current.length > 520) {
      paragraphs.push(current);
      current = "";
    }
  }

  if (current) paragraphs.push(current);
  return paragraphs;
}

export default function ReflowReader({
  book,
  onClose,
}: {
  book: ReaderBook;
  onClose: () => void;
}) {
  const stageRef = useRef<HTMLElement>(null);
  const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([]);
  const [status, setStatus] = useState<"extracting" | "ready" | "empty" | "error">("extracting");
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSize, setFontSize] = useState(20);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [contentWidth, setContentWidth] = useState(690);
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [tone, setTone] = useState<"light" | "sepia" | "dark">("light");
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadingTask = pdfjs.getDocument(book.url);

    const extract = async () => {
      try {
        const pdf = await loadingTask.promise;
        const pages: ExtractedPage[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const pdfPage = await pdf.getPage(pageNumber);
          const content = await pdfPage.getTextContent();
          const lines: string[] = [];
          let line = "";

          for (const item of content.items) {
            if (!("str" in item)) continue;
            const text = item.str.trim();
            if (text) line = line ? `${line} ${text}` : text;
            if (item.hasEOL) {
              lines.push(line);
              line = "";
            }
          }

          if (line) lines.push(line);
          const paragraphs = linesToParagraphs(lines);
          if (paragraphs.length) pages.push({ pageNumber, paragraphs });
          if (!cancelled) {
            setExtractionProgress(Math.round((pageNumber / pdf.numPages) * 100));
          }
        }

        if (!cancelled) {
          setExtractedPages(pages);
          setStatus(pages.length ? "ready" : "empty");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    void extract();
    return () => {
      cancelled = true;
      void loadingTask.destroy();
    };
  }, [book.url]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const wordCount = extractedPages.reduce(
    (total, page) =>
      total + page.paragraphs.reduce(
        (sum, paragraph) => sum + paragraph.split(/\s+/).length,
        0,
      ),
    0,
  );
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 220));

  const onReaderScroll = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const available = stage.scrollHeight - stage.clientHeight;
    setReadingProgress(
      available > 0 ? Math.round((stage.scrollTop / available) * 100) : 100,
    );
  };

  return (
    <main className={`reader tone-${tone}`}>
      <header className="reader-bar">
        <div className="reader-title">
          <button className="reader-icon" onClick={onClose} aria-label="Back to library">
            <ArrowLeft size={20} />
          </button>
          <BrandMark />
          <span>
            <strong>{book.title}</strong>
            <small>
              {status === "ready"
                ? `${wordCount.toLocaleString()} words · ${readingMinutes} min read`
                : `Extracting text · ${extractionProgress}%`}
            </small>
          </span>
        </div>
        <div className="reader-actions">
          <button className="reader-icon" onClick={() => setPanelOpen(!panelOpen)} aria-label="Reader appearance">
            <Sun size={19} />
          </button>
          <button className="reader-icon" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Enter fullscreen">
            <Maximize2 size={18} />
          </button>
        </div>
      </header>

      <aside className={`appearance-panel ${panelOpen ? "open" : ""}`}>
        <div className="panel-heading">
          <strong>Reading appearance</strong>
          <button onClick={() => setPanelOpen(false)}><X size={18} /></button>
        </div>
        <span>Page tone</span>
        <div className="tone-options">
          <button className={tone === "light" ? "active" : ""} onClick={() => setTone("light")}><Sun size={17} /> Light</button>
          <button className={tone === "sepia" ? "active" : ""} onClick={() => setTone("sepia")}><BookOpen size={17} /> Warm</button>
          <button className={tone === "dark" ? "active" : ""} onClick={() => setTone("dark")}><Moon size={17} /> Dark</button>
        </div>
        <span>Typeface</span>
        <div className="font-options">
          <button className={fontFamily === "serif" ? "active" : ""} onClick={() => setFontFamily("serif")}>Serif</button>
          <button className={fontFamily === "sans" ? "active" : ""} onClick={() => setFontFamily("sans")}>Sans</button>
        </div>
        <label className="reader-setting">
          <span>Line spacing</span>
          <input type="range" min="1.45" max="2.2" step="0.05" value={lineHeight} onChange={(event) => setLineHeight(Number(event.target.value))} />
        </label>
        <label className="reader-setting">
          <span>Text width</span>
          <input type="range" min="500" max="900" step="20" value={contentWidth} onChange={(event) => setContentWidth(Number(event.target.value))} />
        </label>
      </aside>

      <section className="document-stage" ref={stageRef} onScroll={onReaderScroll}>
        {status === "extracting" && (
          <div className="reader-loading">
            <BrandMark />
            <strong>Turning pages into words…</strong>
            <span>{extractionProgress}% complete</span>
            <div className="extraction-track"><span style={{ width: `${extractionProgress}%` }} /></div>
          </div>
        )}
        {status === "empty" && (
          <div className="reader-loading error">
            <strong>This PDF doesn’t contain selectable text.</strong>
            <span>It appears to be scanned or image-based. OCR support is needed to transcribe it.</span>
          </div>
        )}
        {status === "error" && (
          <div className="reader-loading error">
            <strong>We couldn’t extract this book.</strong>
            <span>Try uploading a different PDF.</span>
          </div>
        )}
        {status === "ready" && (
          <article
            className={`reflow-book font-${fontFamily}`}
            style={{
              maxWidth: `${contentWidth}px`,
              fontSize: `${fontSize}px`,
              lineHeight,
            }}
          >
            <header className="book-opening">
              <span>YOUR BOOK</span>
              <h1>{book.title}</h1>
              <p>{wordCount.toLocaleString()} words · About {readingMinutes} minutes</p>
            </header>
            {extractedPages.map((extractedPage, pageIndex) => (
              <section className="text-section" key={extractedPage.pageNumber}>
                {pageIndex > 0 && <span className="section-break" aria-hidden="true">• • •</span>}
                {extractedPage.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${extractedPage.pageNumber}-${paragraphIndex}`}>{paragraph}</p>
                ))}
              </section>
            ))}
            <footer className="book-ending"><BrandMark /><span>End of book</span></footer>
          </article>
        )}
      </section>

      <footer className="reader-controls">
        <div className="zoom-controls">
          <button onClick={() => setFontSize((value) => Math.max(15, value - 1))} aria-label="Decrease text size"><Minus size={17} /></button>
          <span>{fontSize}px</span>
          <button onClick={() => setFontSize((value) => Math.min(32, value + 1))} aria-label="Increase text size"><Plus size={17} /></button>
        </div>
        <span className="reading-percent">{readingProgress}% read</span>
        <div className="reader-progress"><span style={{ width: `${readingProgress}%` }} /></div>
      </footer>
    </main>
  );
}
