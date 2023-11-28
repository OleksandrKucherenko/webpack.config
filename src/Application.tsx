import React from "react";

import { PicturesDemo } from "./components/PicturesDemo";
import { EmojiDemo } from "./components/EmojiDemo";

import * as styles from "./Application.css";

export const Application: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* Web fonts */}
      <h1 style={{ padding: "0px", fontFamily: "Pacifico" }}>Hello webpack with React</h1>
      <h2>NODE_ENV: {process.env.NODE_ENV}</h2>
      <div className={styles.variables}>
        <div>PUBLIC_PATH: {process.env.PUBLIC_PATH}</div>
        <div>CLIENT_ENVIRONMENT: {process.env.CLIENT_ENVIRONMENT}</div>
        <div>REACT_APP_CLIENT_ENVIRONMENT: {process.env.REACT_APP_CLIENT_ENVIRONMENT}</div>
      </div>
      {/* Different image types support */}
      <h2>AVIF Support</h2>
      <PicturesDemo />
      <EmojiDemo />
    </div>
  );
};
