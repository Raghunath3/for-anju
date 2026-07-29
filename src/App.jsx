import { useEffect, useState } from "react";
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

const pages = [p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13];

function App() {
  const [bookSize, setBookSize] = useState({
    width: 400,
    height: 565,
  });

  useEffect(() => {
    function resizeBook() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const width = Math.min(vw * 0.42, 430);
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

  return (
    <div className="container">
      <HTMLFlipBook
        width={bookSize.width}
        height={bookSize.height}
        size="fixed"
        showCover={true}
        mobileScrollSupport={true}
        maxShadowOpacity={0.5}
      >
        {pages.map((img, index) => (
          <div className="page" key={index}>
            <img src={img} alt={`Page ${index + 1}`} />
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
}

export default App;