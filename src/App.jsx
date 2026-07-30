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
const LOADING_DURATION = 4200; // ms — time the "For Anju" screen stays up

function App() {
  const flipBook = useRef(null);
  const audioCtxRef = useRef(null);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );

  const [bookSize, setBookSize] = useState({ width: 400, height: 565 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasFlipped, setHasFlipped] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [revealIndex, setRevealIndex] = useState(null);

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

      if (mobile) {
        width = Math.min(vw * 0.92, 480);
      } else {
        width = Math.min(vw * 0.46, 500);
      }

      const height = width * 1.414;

      setBookSize({
        width,
        height: Math.min(height, vh * 0.82),
      });
    }

    resizeBook();
    window.addEventListener("resize", resizeBook);
    return () => window.removeEventListener("resize", resizeBook);
  }, []);

  // Loading screen
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOADING_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // Reset page counter whenever the book remounts (mobile <-> desktop)
  useEffect(() => {
    setCurrentPage(0);
  }, [isMobile]);

  // Trigger a fresh "reveal" flash every time the active page changes
  useEffect(() => {
    setRevealIndex(null);
    const raf = requestAnimationFrame(() => setRevealIndex(currentPage));
    const clear = setTimeout(() => setRevealIndex(null), 750);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(clear);
    };
  }, [currentPage]);

  // ===========================
  // Sound (synthesized, no file needed)
  // ===========================
  const playFlipSound = useCallback(() => {
    if (!soundOn) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const duration = 0.16;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.pow(1 - i / bufferSize, 2.2);
        data[i] = (Math.random() * 2 - 1) * decay;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2000;
      filter.Q.value = 0.6;

      const gain = ctx.createGain();
      gain.gain.value = 0.14;

      noise.connect(filter).connect(gain).connect(ctx.destination);
      noise.start();
    } catch (err) {
      console.log(err);
    }
  }, [soundOn]);

  // ===========================
  // Navigation
  // ===========================
  const goNext = useCallback(() => {
    const book = flipBook.current?.pageFlip();
    if (!book) return;

    const current = book.getCurrentPageIndex();
    if (current < pages.length - 1) {
      book.flipNext();
      playFlipSound();
      setHasFlipped(true);
    }
  }, [playFlipSound]);

  const goPrev = useCallback(() => {
    const book = flipBook.current?.pageFlip();
    if (!book) return;

    const current = book.getCurrentPageIndex();
    if (current > 0) {
      // turnToPage is more reliable than flipPrev(), which can drift out of
      // sync with the library's own internal index after a remount/resize.
      book.turnToPage(current - 1);
      playFlipSound();
      setHasFlipped(true);
    }
  }, [playFlipSound]);

  const jumpToPage = useCallback(
    (index) => {
      const book = flipBook.current?.pageFlip();
      if (!book) return;
      book.turnToPage(index);
      playFlipSound();
      setHasFlipped(true);
    },
    [playFlipSound]
  );

  const replay = useCallback(() => {
    jumpToPage(0);
  }, [jumpToPage]);

  const handleFlip = (e) => {
    setCurrentPage(e.data);
  };

  // Keyboard arrow support (desktop)
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
        <p>Every page holds a piece of my heart.</p>
        <div className="loader"></div>
      </div>
    );
  }

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= pages.length - 1;

  return (
    <div className="container">
      {/* Warm spotlight glow above the book */}
      <div className="spotlight-glow" />

      <div className="book-and-nav">
        <div
          className={`book-wrapper ${isMobile ? "mobile-mode" : "desktop-mode"}`}
        >
          {/* Layered page-edge sheets — desktop spread only */}
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
              showCover={true}
              usePortrait={true}
              mobileScrollSupport={true}
              maxShadowOpacity={0.5}
              disableFlipByClick={true}
              clickEventForward={false}
              flippingTime={1500}
              onFlip={handleFlip}
            >
              {pages.map((img, index) => (
                <div
                  className={`page ${index === 0 ? "cover-page" : ""} ${
                    revealIndex === index ? "revealing" : ""
                  }`}
                  key={index}
                >
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
              showCover={true}
              usePortrait={false}
              mobileScrollSupport={true}
              maxShadowOpacity={0.5}
              disableFlipByClick={true}
              clickEventForward={false}
              flippingTime={900}
              onFlip={handleFlip}
            >
              {pages.map((img, index) => (
                <div
                  className={`page ${index === 0 ? "cover-page" : ""} ${
                    revealIndex === index ? "revealing" : ""
                  }`}
                  key={index}
                >
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

          {/* "The End" overlay on the last page */}
          {isLastPage && (
            <div className="the-end-overlay">
              <p className="the-end-text">The End ❤️</p>
              <button
                type="button"
                className="replay-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  replay();
                }}
              >
                ↺ Read again
              </button>
            </div>
          )}
        </div>

        {/* Soft ambient light pool under the book */}
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

          <button
            type="button"
            className="mute-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSoundOn((s) => !s);
            }}
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
            title={soundOn ? "Mute sound" : "Unmute sound"}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
        </div>

        <span className="page-indicator">
          {currentPage + 1} / {pages.length}
        </span>
      </div>
    </div>
  );
}

export default App;