import React from "react";
import reactDom from "react-dom";

const Component: React.FC = () => {
  return <div style={{ padding: "30px" }}>Hello webpack with React</div>;
};

const rootElement = document.getElementById("root");

reactDom.render(<Component />, rootElement);
