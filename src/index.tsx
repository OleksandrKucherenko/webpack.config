import React from "react";
import reactDom from "react-dom";
import img1 from "./sample-01.avif";
import img2 from "./sample-02-url.avif";
import imgPng from "./sample-03.png";
// import emoji from "./assets/fonts/NotoColorEmoji-Regular.ttf";
import Pink from "./pink.svg";
import pinkUrl from "./pink.svg?url";

export const loadFont = async (fontFamily: string, url: string): Promise<void> => {
  const font = new FontFace(fontFamily, `local(${fontFamily}), url(${url})`);
  // wait for font to be loaded
  await font.load();
  // add font to document
  document.fonts.add(font);
  // enable font with CSS class
  document.body.classList.add("fonts-loaded");
};

const PicturesDemo = () => {
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
      <img src={pinkUrl} width="200" height="200" />
      <Pink width="200" height="200" viewBox="0 0 500 500" />
      {/** Load style as embedded data in base64 encoding. */}
      <div style={{ background: `url(${img2}) top center no-repeat`, height: "300px" }} />
      <img src={imgPng} alt="embedded png" width={64} />
    </>
  );
};

const Application: React.FC = () => {
  // loadFont("emoji", emoji);

  return (
    <>
      <h1 style={{ padding: "30px", fontFamily: "Pacifico" }}>Hello webpack with React</h1>
      <h2 style={{ fontFamily: "emoji" }}>AVIF Support</h2>
      <PicturesDemo />
    </>
  );
};

const rootElement = document.getElementById("root");

reactDom.render(<Application />, rootElement);
