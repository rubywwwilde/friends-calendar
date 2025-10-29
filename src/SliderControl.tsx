import { type Component, Show } from "solid-js";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onInput: (value: number) => void;
  helpText?: string;
  showPending?: boolean;
  formatValue?: (value: number) => string;
}

const SliderControl: Component<SliderControlProps> = (props) => {
  const displayValue = () => {
    if (props.formatValue) {
      return props.formatValue(props.value);
    }
    return props.value.toFixed(0);
  };

  return (
    <div style={{ "margin-bottom": "20px" }}>
      <label
        style={{
          display: "block",
          "margin-bottom": "8px",
          "font-size": "14px",
          "font-weight": "500",
        }}
      >
        {props.label}: {displayValue()}
        <Show when={props.showPending}>
          <span
            style={{
              color: "#fbbf24",
              "margin-left": "8px",
              "font-size": "12px",
            }}
          >
            (pending...)
          </span>
        </Show>
      </label>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onInput={(e) => props.onInput(parseFloat(e.currentTarget.value))}
        style={{
          width: "100%",
          cursor: "pointer",
        }}
      />
      <Show when={props.helpText}>
        <div
          style={{
            "font-size": "12px",
            color: "#999",
            "margin-top": "4px",
          }}
        >
          {props.helpText}
        </div>
      </Show>
    </div>
  );
};

export default SliderControl;
