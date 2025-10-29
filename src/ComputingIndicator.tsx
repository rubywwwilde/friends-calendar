import { type Component } from "solid-js";

const ComputingIndicator: Component = () => {
  return (
    <div
      style={{
        "font-size": "12px",
        color: "#fbbf24",
        display: "flex",
        "align-items": "center",
        gap: "6px",
      }}
    >
      <div
        style={{
          width: "12px",
          height: "12px",
          border: "2px solid #fbbf24",
          "border-top-color": "transparent",
          "border-radius": "50%",
          animation: "spin 0.6s linear infinite",
        }}
      />
      Computing...
    </div>
  );
};

export default ComputingIndicator;
