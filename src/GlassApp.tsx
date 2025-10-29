import { debounce } from "@solid-primitives/scheduled";
import { type Component, createEffect, createSignal, on } from "solid-js";

import Background from "./Background";
import ControlPanel from "./ControlPanel";
import GlassCircle from "./GlassCircle";
import {
  createDisplacementMap,
  generateDisplacementArray,
  imageDataToDataURL,
} from "./glassPhysics";
import SvgFilters from "./SvgFilters";

const App: Component = () => {
  const [bezelWidth, setBezelWidth] = createSignal(0.3);
  const [glassThickness, setGlassThickness] = createSignal(50);
  const [scale, setScale] = createSignal(44);
  const [imageURL, setImageURL] = createSignal("");
  const defaultImage =
    "https://www.nao.ac.jp/en/contents/news/science/2021/20210910-cfca-fig3-full.jpg";
  const [activeImageURL, setActiveImageURL] = createSignal(defaultImage);
  const [useImage, setUseImage] = createSignal(true);

  // Debounced values
  const [debouncedBezel, setDebouncedBezel] = createSignal(0.3);
  const [debouncedThickness, setDebouncedThickness] = createSignal(100);

  // Derived displacement data
  const [dataURL, setDataURL] = createSignal("");
  const [maxDisplacement, setMaxDisplacement] = createSignal(0);
  const [isComputing, setIsComputing] = createSignal(false);

  const [circleSize, setCircleSize] = createSignal(420);

  const filterId = "liquidGlassFilter";

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
    on([debouncedBezel, debouncedThickness, circleSize], () => {
      setIsComputing(true);

      requestAnimationFrame(() => {
        const data = generateDisplacementArray(
          127,
          debouncedBezel(),
          debouncedThickness(),
        );
        let imageData = createDisplacementMap(
          circleSize(),
          circleSize() / 2,
          data,
        );

        setDataURL(imageDataToDataURL(imageData));
        setMaxDisplacement(data.maxDisplacement);
        setIsComputing(false);

        console.log(
          "Updated - Bezel:",
          debouncedBezel(),
          "Thickness:",
          debouncedThickness(),
          "Circle size:",
          circleSize(),
          "Max displacement:",
          data.maxDisplacement,
        );
      });
    }),
  );

  const handleUseImage = () => {
    setActiveImageURL(imageURL() || defaultImage);
    setUseImage(true);
  };

  const handleUseGradient = () => {
    setUseImage(false);
  };

  return (
    <div>
      <SvgFilters
        filterId={filterId}
        dataURL={dataURL()}
        circleSize={circleSize()}
        scale={scale()}
      />

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
        <Background useImage={useImage()} imageURL={activeImageURL()} />

        <GlassCircle size={circleSize()} filterId={filterId} />

        <ControlPanel
          imageURL={imageURL()}
          onImageURLChange={setImageURL}
          onUseImage={handleUseImage}
          onUseGradient={handleUseGradient}
          useImage={useImage()}
          circleSize={circleSize()}
          onCircleSizeChange={setCircleSize}
          bezelWidth={bezelWidth()}
          onBezelWidthChange={setBezelWidth}
          bezelPending={bezelWidth() !== debouncedBezel()}
          glassThickness={glassThickness()}
          onGlassThicknessChange={setGlassThickness}
          thicknessPending={glassThickness() !== debouncedThickness()}
          scale={scale()}
          onScaleChange={setScale}
          isComputing={isComputing()}
          maxDisplacement={maxDisplacement()}
        />
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }

        @keyframes slowPan {
          0% { transform: translate(0, 0) scale(1.05); }
          25% { transform: translate(-2%, 2%) scale(1.08); }
          50% { transform: translate(0, -2%) scale(1.1); }
          75% { transform: translate(2%, 0) scale(1.08); }
          100% { transform: translate(0, 0) scale(1.05); }
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

        input[type="text"]:focus {
          border-color: rgba(79, 189, 187, 0.5);
          background: rgba(255, 255, 255, 0.15);
        }

        button:hover:not(:disabled) {
          background: rgba(79, 189, 187, 0.4);
        }

        button:active:not(:disabled) {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default App;
