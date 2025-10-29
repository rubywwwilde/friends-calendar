import { type Component, Show } from "solid-js";
import ComputingIndicator from "./ComputingIndicator";
import ImageUrlInput from "./ImageUrlInput";
import SliderControl from "./SliderControl";

interface ControlPanelProps {
  // Image controls
  imageURL: string;
  onImageURLChange: (url: string) => void;
  onUseImage: () => void;
  onUseGradient: () => void;
  useImage: boolean;

  // Circle size
  circleSize: number;
  onCircleSizeChange: (size: number) => void;

  // Bezel
  bezelWidth: number;
  onBezelWidthChange: (width: number) => void;
  bezelPending: boolean;

  // Glass thickness
  glassThickness: number;
  onGlassThicknessChange: (thickness: number) => void;
  thicknessPending: boolean;

  // Scale
  scale: number;
  onScaleChange: (scale: number) => void;

  // Status
  isComputing: boolean;
  maxDisplacement: number;
}

const ControlPanel: Component<ControlPanelProps> = (props) => {
  return (
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
        "max-width": "320px",
        "z-index": 20,
        "backdrop-filter": "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        "max-height": "90vh",
        "overflow-y": "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
          "margin-bottom": "16px",
        }}
      >
        <h3 style={{ margin: "0", "font-size": "18px", "font-weight": "600" }}>
          Glass Controls
        </h3>
        <Show when={props.isComputing}>
          <ComputingIndicator />
        </Show>
      </div>

      {/* Background Image URL */}
      <ImageUrlInput
        imageURL={props.imageURL}
        onImageURLChange={props.onImageURLChange}
        onUseImage={props.onUseImage}
        onUseGradient={props.onUseGradient}
        useImage={props.useImage}
      />

      {/* Circle Size */}
      <SliderControl
        label="Circle Size"
        value={props.circleSize}
        min={100}
        max={720}
        step={10}
        onInput={props.onCircleSizeChange}
        formatValue={(v) => `${v}px`}
        helpText="Adjust the diameter of the glass circle"
      />

      {/* Bezel Width */}
      <SliderControl
        label="Bezel Width"
        value={props.bezelWidth}
        min={0}
        max={1}
        step={0.01}
        onInput={props.onBezelWidthChange}
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
        showPending={props.bezelPending}
        helpText="0% = no bezel, 50% = thick bezel"
      />

      {/* Glass Thickness */}
      <SliderControl
        label="Glass Thickness"
        value={props.glassThickness}
        min={0}
        max={100}
        step={5}
        onInput={props.onGlassThicknessChange}
        formatValue={(v) => `${v.toFixed(0)}px`}
        showPending={props.thicknessPending}
        helpText="Higher = more distortion"
      />

      {/* Distortion Scale */}
      <SliderControl
        label="Distortion Scale"
        value={props.scale}
        min={0}
        max={100}
        step={1}
        onInput={props.onScaleChange}
        helpText="Fine-tune the visual effect (updates instantly)"
      />

      {/* Info */}
      <div
        style={{
          "font-size": "12px",
          color: "#666",
          "padding-top": "12px",
          "border-top": "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        Max displacement: {props.maxDisplacement.toFixed(2)}
      </div>
    </div>
  );
};

export default ControlPanel;
