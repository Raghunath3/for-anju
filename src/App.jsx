import { useEffect, useRef, useState } from "react";
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

  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );

  const [bookSize, setBookSize] = useState({ width: 400, height: 565 });

  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);

  // Responsive book size + mobile/desktop mode
  useEffect(() => {
    function resizeBook() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const mobile = vw < MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      let width;

      if (mobile) {
        // Single page, large, fills most of the screen
        width = Math.min(vw * 0.92, 480);
      } else {
        // Two-page spread, so each page is roughly half the usable width
        width = Math.min(vw * 0.46, 500);
      }

      const height = width * 1.414;

      setBookSize({
        width,
        height: Math.min(height, vh * 0.9),
      });
    }

    resizeBook();

    window.addEventListener("resize", resizeBook);

    return () => window.removeEventListener("resize", resizeBook);
  }, []);

  // Loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, LOADING_DURATION);

    return () => clearTimeout(timer);
  }, []);

  // NOTE: the old auto-flip-past-the-cover effect has been removed on purpose.
  // The reader now stays on the cover until they tap/click Next themselves.

  const goNext = () => {
    try {
      flipBook.current?.pageFlip()?.flipNext();
    } catch (err) {
      console.log(err);
    }
  };

  const goPrev = () => {
    try {
      flipBook.current?.pageFlip()?.flipPrev();
    } catch (err) {
      console.log(err);
    }
  };

  const handleFlip = (e) => {
    setCurrentPage(e.data);
  };

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
      <div className="book-and-nav">
        <div
          className={`book-wrapper ${isMobile ? "mobile-mode" : "desktop-mode"}`}
        >
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
                  className={`page ${index === 0 ? "cover-page" : ""}`}
                  key={index}
                >
                  <img src={img} alt={`Page ${index + 1}`} />
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
                  className={`page ${index === 0 ? "cover-page" : ""}`}
                  key={index}
                >
                  <img src={img} alt={`Page ${index + 1}`} />
                </div>
              ))}
            </HTMLFlipBook>
          )}
        </div>

        <div className="nav-controls">
          <button
            className="nav-btn"
            onClick={goPrev}
            disabled={isFirstPage}
            aria-label="Previous page"
          >
            ‹
          </button>

          <span className="page-indicator">
            {currentPage + 1} / {pages.length}
          </span>

          <button
            className="nav-btn"
            onClick={goNext}
            disabled={isLastPage}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;