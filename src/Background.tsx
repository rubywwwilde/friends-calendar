import { type Component, Show } from "solid-js";

interface BackgroundProps {
  useImage: boolean;
  imageURL: string;
}

const Background: Component<BackgroundProps> = (props) => {
  return (
    <Show
      when={props.useImage && props.imageURL}
      fallback={
        // SVG Gradient Background with Grid
        <svg
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
          }}
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="100%" height="100%" fill="url(#doubleGradient)" />
          <rect width="100%" height="100%" fill="url(#gridPattern)" />
        </svg>
      }
    >
      {/* Animated Image Background */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "110%",
            height: "110%",
            top: "-5%",
            left: "-5%",
            "background-image": `url(${props.imageURL})`,
            "background-size": "cover",
            "background-position": "center",
            animation:
              "slowZoom 20s ease-in-out infinite alternate, slowPan 30s ease-in-out infinite",
          }}
        />
      </div>
    </Show>
  );
};

export default Background;
