import React from "react";
import img1 from "../assets/images/sample-01.avif";
import img2 from "../assets/images/sample-02-url.avif";
import imgPng from "../assets/images/sample-03.png";
import Pink from "../assets/images/pink.svg";
import pinkUrl from "../assets/images/pink.svg?url";
import "./PicturesDemo.scss";
import styles from "./PicturesDemo.module.css";

export const PicturesDemo = () => {
  return (
    <div id="picture-demo-wrapper" className={styles.wrapper}>
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
      <img src={imgPng} alt="embedded png" width={64} height={64} />
      {/** Load style as embedded data in base64 encoding. */}
      <div style={{ background: `url(${img2}) top center no-repeat`, height: "300px", minWidth: "200px" }} />
    </div>
  );
};
