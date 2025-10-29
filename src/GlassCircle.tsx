import { type Component } from "solid-js";

interface GlassCircleProps {
  size: number;
  filterId: string;
}

const GlassCircle: Component<GlassCircleProps> = (props) => {
  return (
    <div
      style={{
        width: `${props.size}px`,
        height: `${props.size}px`,
        "border-radius": "50%",
        "backdrop-filter": `url(#${props.filterId})`,
        background: "rgba(255, 255, 255, 0.05)",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        position: "relative",
        "z-index": 10,
        transition: "width 0.3s ease, height 0.3s ease",
      }}
    />
  );
};

export default GlassCircle;
