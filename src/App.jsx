import { useEffect, useRef, useState, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";

import p1 from "./images/1.png";
import p2 from "./images/2.png";
import p3 from "./images/3.png";
import p4 from "./images/4.png";
import p5 from "./images/5.png";
import p6 from "./images/6.png";
import p7 from "./images/7.png";
import p8 from "./images/8.png";
import p9 from "./images/9.png";
import p10 from "./images/10.png";
import p11 from "./images/11.png";
import p12 from "./images/12.png";
import p13 from "./images/13.png";

import "./App.css";

const pages = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13];

const MOBILE_BREAKPOINT = 768;
const MIN_LOADING_DURATION = 4200; // ms — minimum time the "For Anju" screen stays up

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve; // don't block forever on one bad file
    img.src = src;
  });
}

function App() {
  const flipBook = useRef(null);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );

  const [bookSize, setBookSize] = useState({ width: 400, height: 565 });
  const [loading, setLoading] = useState(true);
  const [imagesReady, setImagesReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasFlipped, setHasFlipped] = useState(false);

  // ===========================
  // Preload all 13 page images in parallel, starting immediately on mount
  // ===========================
  useEffect(() => {
    let cancelled = false;

    Promise.all(pages.map(preloadImage)).then(() => {
      if (!cancelled) setImagesReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Minimum time the loading screen stays visible, so it doesn't flash by
  // instantly on a fast connection
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_LOADING_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // Only dismiss loading once BOTH the images are ready AND the minimum
  // display time has passed — whichever finishes last decides.
  useEffect(() => {
    if (imagesReady && minTimeElapsed) {
      setLoading(false);
    }
  }, [imagesReady, minTimeElapsed]);

  // ===========================
  // Responsive book size + mode
  // ===========================
  useEffect(() => {
    function resizeBook() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const mobile = vw < MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      let width;
      let heightRatio;

      if (mobile) {
        width = Math.min(vw * 0.92, 480);
        heightRatio = 0.72;
      } else {
        width = Math.min(vw * 0.46, 500);
        heightRatio = 0.66;
      }

      const height = width * 1.414;

      setBookSize({
        width,
        height: Math.min(height, vh * heightRatio),
      });
    }

    resizeBook();
    window.addEventListener("resize", resizeBook);
    return () => window.removeEventListener("resize", resizeBook);
  }, []);

  // Reset page counter whenever the book remounts (mobile <-> desktop)
  useEffect(() => {
    setCurrentPage(0);
  }, [isMobile]);

  // ===========================
  // Navigation
  // ===========================
  const goNext = useCallback(() => {
    const book = flipBook.current?.pageFlip();
    if (!book) return;

    const current = book.getCurrentPageIndex();
    if (current < pages.length - 1) {
      book.flipNext();
      setHasFlipped(true);
    }
  }, []);

  const goPrev = useCallback(() => {
    const book = flipBook.current?.pageFlip();
    if (!book) return;

    const current = book.getCurrentPageIndex();
    if (current > 0) {
      book.turnToPage(current - 1);
      setHasFlipped(true);
    }
  }, []);

  const jumpToPage = useCallback((index) => {
    const book = flipBook.current?.pageFlip();
    if (!book) return;
    book.turnToPage(index);
    setHasFlipped(true);
  }, []);

  const handleFlip = (e) => {
    setCurrentPage(e.data);
  };

  useEffect(() => {
    function handleKey(e) {
      if (loading) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [loading, goNext, goPrev]);

  if (loading) {
    return (
      <div className="loading-screen">
        <h1>For Anju ❤️</h1>
        <p>Smile first :)</p>
        <div className="loader"></div>
      </div>
    );
  }

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= pages.length - 1;

  return (
    <div className="container">
      <div className="spotlight-glow" />

      <div className="book-and-nav">
        <div
          className={`book-wrapper ${isMobile ? "mobile-mode" : "desktop-mode"}`}
        >
          {!isMobile && (
            <div className="page-edges" aria-hidden="true">
              <div className="edge-sheet edge-sheet-1" />
              <div className="edge-sheet edge-sheet-2" />
              <div className="edge-sheet edge-sheet-3" />
            </div>
          )}

          {isMobile ? (
            <HTMLFlipBook
              key="mobile-book"
              ref={flipBook}
              width={bookSize.width}
              height={bookSize.height}
              size="fixed"
              minWidth={250}
              maxWidth={500}
              minHeight={353}
              maxHeight={750}
              showCover={false}
              usePortrait={true}
              mobileScrollSupport={true}
              maxShadowOpacity={0.5}
              disableFlipByClick={true}
              clickEventForward={false}
              flippingTime={1500}
              onFlip={handleFlip}
            >
              {pages.map((img, index) => (
                <div className="page" key={index}>
                  <img
                    src={img}
                    alt={`Page ${index + 1}`}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              ))}
            </HTMLFlipBook>
          ) : (
            <HTMLFlipBook
              key="desktop-book"
              ref={flipBook}
              width={bookSize.width}
              height={bookSize.height}
              size="fixed"
              minWidth={250}
              maxWidth={500}
              minHeight={353}
              maxHeight={707}
              showCover={false}
              usePortrait={false}
              mobileScrollSupport={true}
              maxShadowOpacity={0.5}
              disableFlipByClick={true}
              clickEventForward={false}
              flippingTime={900}
              onFlip={handleFlip}
            >
              {pages.map((img, index) => (
                <div className="page" key={index}>
                  <img
                    src={img}
                    alt={`Page ${index + 1}`}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              ))}
            </HTMLFlipBook>
          )}
        </div>

        <div className="light-pool" aria-hidden="true" />

        <div className="nav-controls">
          <button
            type="button"
            className="nav-btn"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            onTouchStart={(e) => e.stopPropagation()}
            disabled={isFirstPage}
            aria-label="Previous page"
          >
            ‹
          </button>

          <div className="progress-dots" role="tablist" aria-label="Pages">
            {pages.map((_, index) => (
              <button
                type="button"
                key={index}
                className={`dot ${index === currentPage ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToPage(index);
                }}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className={`nav-btn ${
              !hasFlipped && isFirstPage ? "pulse-hint" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            onTouchStart={(e) => e.stopPropagation()}
            disabled={isLastPage}
            aria-label="Next page"
          >
            ›
          </button>
        </div>

        <span className="page-indicator desktop-only">
          {currentPage + 1} / {pages.length}
        </span>
      </div>
    </div>
  );
}

export default App;