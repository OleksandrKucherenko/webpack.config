import React from "react";
import reactDom from "react-dom";
import img1 from "./sample-01.avif";
import img2 from "./sample-02-url.avif";
import imgPng from "./sample-03.png";

const AvifPicture = () => {
  return (
    <>
      <picture>
        <source srcSet={img1} type="image/avif" />
        <img srcSet={img1} alt="avif big image" height={200} />
      </picture>
      {/** Load as embedded data in base64 encoding. */}
      <picture>
        <source srcSet={img2} type="image/avif" />
        <img srcSet={img2} alt="avif embedded image" height={200} />
      </picture>
      {/** Load style as embedded data in base64 encoding. */}
      <div style={{ background: `url(${img2}) top center no-repeat`, height: "300px" }} />
      <img src={imgPng} alt="embedded png" />
    </>
  );
};

const Application: React.FC = () => {
  return (
    <>
      <div style={{ padding: "30px" }}>Hello webpack with React</div>
      <h2>AVIF Support</h2>
      <AvifPicture />
    </>
  );
};

const rootElement = document.getElementById("root");

reactDom.render(<Application />, rootElement);
