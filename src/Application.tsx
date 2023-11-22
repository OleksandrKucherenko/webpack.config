import React from "react";

import { PicturesDemo } from "./components/PicturesDemo";
import { EmojiDemo } from "./components/EmojiDemo";

export const Application: React.FC = () => {
  return (
    <>
      {/* Web fonts */}
      <h1 style={{ padding: "0px", fontFamily: "Pacifico" }}>Hello webpack with React</h1>
      {/* Different image types support */}
      <h2>AVIF Support</h2>
      <PicturesDemo />
      <EmojiDemo />
    </>
  );
};
