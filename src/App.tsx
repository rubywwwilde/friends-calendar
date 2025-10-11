import { debounce } from "@solid-primitives/scheduled";
import { type Component, createEffect, createSignal, on } from "solid-js";

import {
  createDisplacementMap,
  generateDisplacementArray,
  imageDataToDataURL,
} from "./glassPhysics";

const App: Component = () => {
  // Interactive controls
  const [bezelWidth, setBezelWidth] = createSignal(0.3);
  const [glassThickness, setGlassThickness] = createSignal(1000);
  const [scale, setScale] = createSignal(44);

  // Debounced values
  const [debouncedBezel, setDebouncedBezel] = createSignal(0.3);
  const [debouncedThickness, setDebouncedThickness] = createSignal(100);

  // Derived displacement data
  const [dataURL, setDataURL] = createSignal("");
  const [maxDisplacement, setMaxDisplacement] = createSignal(0);
  const [isComputing, setIsComputing] = createSignal(false);

  const circleSize = 256;
  const filterId = "liquidGlassFilter";

  // Debounce functions
  const debouncedUpdateBezel = debounce((value: number) => {
    setDebouncedBezel(value);
  }, 300);

  const debouncedUpdateThickness = debounce((value: number) => {
    setDebouncedThickness(value);
  }, 300);

  createEffect(() => {
    debouncedUpdateBezel(bezelWidth());
  });

  createEffect(() => {
    debouncedUpdateThickness(glassThickness());
  });

  // Regenerate displacement map
  createEffect(
    on([debouncedBezel, debouncedThickness], () => {
      setIsComputing(true);

      requestAnimationFrame(() => {
        const data = generateDisplacementArray(
          127,
          debouncedBezel(),
          debouncedThickness(),
        );
        let imageData = createDisplacementMap(circleSize, circleSize / 2, data);

        setDataURL(imageDataToDataURL(imageData));
        setMaxDisplacement(data.maxDisplacement);
        setIsComputing(false);

        console.log(
          "Updated - Bezel:",
          debouncedBezel(),
          "Thickness:",
          debouncedThickness(),
          "Max displacement:",
          data.maxDisplacement,
        );
      });
    }),
  );

  return (
    <div>
      {/* SVG Filter and Pattern Definitions */}
      <svg
        color-interpolation-filters="sRGB"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          {/* Displacement filter */}
          <filter
            id={filterId}
            filterUnits="objectBoundingBox"
            primitiveUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1"
            height="1"
          >
            <feImage
              href={dataURL()}
              x="0"
              y="0"
              width={circleSize}
              height={circleSize}
              result="displacementMap"
              preserveAspectRatio="none"
            />
            <feDisplacementMap
              id="disp"
              in="SourceGraphic"
              in2="displacementMap"
              scale={scale()}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Animated Grid Pattern */}
          <pattern
            id="gridPattern"
            x="-15"
            y="-15"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <animate
              attributeName="x"
              from="-15"
              to="15"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              from="-15"
              to="15"
              dur="2s"
              repeatCount="indefinite"
            />
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="#D7E8E6"
              stroke-width="3"
              opacity="0.8"
            />
          </pattern>

          {/* Double Gradient */}
          <linearGradient
            id="doubleGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stop-color="#4FBDBB" />
            <stop offset="50%" stop-color="#AFBDBB" />
            <stop offset="100%" stop-color="#DFBDBB" />
          </linearGradient>
        </defs>
      </svg>

      {/* Animated Background */}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          position: "relative",
          background: "#000",
        }}
      >
        {/* SVG Background with Grid */}
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

        {/* Glass Circle */}
        <div
          style={{
            width: `${circleSize}px`,
            height: `${circleSize}px`,
            "border-radius": "50%",
            "backdrop-filter": `url(#${filterId})`,
            background: "rgba(255, 255, 255, 0.05)",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            position: "relative",
            "z-index": 10,
          }}
        />

        {/* Control Panel */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(0, 0, 0, 0.8)",
            padding: "20px",
            "border-radius": "12px",
            color: "white",
            "min-width": "280px",
            "z-index": 20,
            "backdrop-filter": "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              "justify-content": "space-between",
              "align-items": "center",
              "margin-bottom": "16px",
            }}
          >
            <h3
              style={{ margin: "0", "font-size": "18px", "font-weight": "600" }}
            >
              Glass Controls
            </h3>
            {isComputing() && (
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
            )}
          </div>

          {/* Bezel Width */}
          <div style={{ "margin-bottom": "20px" }}>
            <label
              style={{
                display: "block",
                "margin-bottom": "8px",
                "font-size": "14px",
              }}
            >
              Bezel Width: {(bezelWidth() * 100).toFixed(0)}%
              {bezelWidth() !== debouncedBezel() && (
                <span
                  style={{
                    color: "#fbbf24",
                    "margin-left": "8px",
                    "font-size": "12px",
                  }}
                >
                  (pending...)
                </span>
              )}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={bezelWidth()}
              onInput={(e) => setBezelWidth(parseFloat(e.currentTarget.value))}
              style={{
                width: "100%",
                cursor: "pointer",
              }}
            />
            <div
              style={{
                "font-size": "12px",
                color: "#999",
                "margin-top": "4px",
              }}
            >
              0% = no bezel, 50% = thick bezel
            </div>
          </div>

          {/* Glass Thickness */}
          <div style={{ "margin-bottom": "20px" }}>
            <label
              style={{
                display: "block",
                "margin-bottom": "8px",
                "font-size": "14px",
              }}
            >
              Glass Thickness: {glassThickness().toFixed(0)}px
              {glassThickness() !== debouncedThickness() && (
                <span
                  style={{
                    color: "#fbbf24",
                    "margin-left": "8px",
                    "font-size": "12px",
                  }}
                >
                  (pending...)
                </span>
              )}
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={glassThickness()}
              onInput={(e) =>
                setGlassThickness(parseFloat(e.currentTarget.value))
              }
              style={{
                width: "100%",
                cursor: "pointer",
              }}
            />
            <div
              style={{
                "font-size": "12px",
                color: "#999",
                "margin-top": "4px",
              }}
            >
              Higher = more distortion
            </div>
          </div>

          {/* Scale */}
          <div style={{ "margin-bottom": "20px" }}>
            <label
              style={{
                display: "block",
                "margin-bottom": "8px",
                "font-size": "14px",
              }}
            >
              Distortion Scale: {scale().toFixed(0)}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={scale()}
              onInput={(e) => setScale(parseFloat(e.currentTarget.value))}
              style={{
                width: "100%",
                cursor: "pointer",
              }}
            />
            <div
              style={{
                "font-size": "12px",
                color: "#999",
                "margin-top": "4px",
              }}
            >
              Fine-tune the visual effect (updates instantly)
            </div>
          </div>

          {/* Info */}
          <div
            style={{
              "font-size": "12px",
              color: "#666",
              "padding-top": "12px",
              "border-top": "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            Max displacement: {maxDisplacement().toFixed(2)}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 5px;
          height: 6px;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          cursor: pointer;
          border-radius: 50%;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default App;
