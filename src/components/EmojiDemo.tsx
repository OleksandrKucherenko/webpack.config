import React from "react";
import emoji from "../assets/fonts/NotoColorEmoji-Regular-subset.woff2";
import styles from "./EmojiDemo.module.scss";

export const loadFont = async (fontFamily: string, url: string): Promise<void> => {
  const font = new FontFace(fontFamily, `local(${fontFamily}), url(${url})`);
  // wait for font to be loaded
  await font.load();
  // add font to document
  document.fonts.add(font);
  // enable font with CSS class
  document.body.classList.add("fonts-loaded");
};

export const EmojiDemo: React.FC = () => {
  loadFont("emoji", emoji).finally(() => {
    console.log("emoji font loaded");
  });

  return (
    <>
      {/* Custom Font emoji vs Default */}
      <h1>Emoji Font</h1>
      <h2 style={{ fontFamily: "emoji" }}>🩷💀🫱🏿‍🫲🏻🌴🐢🐐🍄⚽🫧👑📸🪼👀🚨🏡🕊️🏆😻🌟🧿🍀🫶🏾🍜</h2>
      <h2 className={styles.defaults}>🩷💀🫱🏿‍🫲🏻🌴🐢🐐🍄⚽🫧👑📸🪼👀🚨🏡🕊️🏆😻🌟🧿🍀🫶🏾🍜</h2>
    </>
  );
};
