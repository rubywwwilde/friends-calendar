import { type Component } from "solid-js";

interface ImageUrlInputProps {
  imageURL: string;
  onImageURLChange: (url: string) => void;
  onUseImage: () => void;
  onUseGradient: () => void;
  useImage: boolean;
}

const ImageUrlInput: Component<ImageUrlInputProps> = (props) => {
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
        Background Image
      </label>
      <input
        type="text"
        placeholder="Paste image URL here..."
        value={props.imageURL}
        onInput={(e) => props.onImageURLChange(e.currentTarget.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          "border-radius": "6px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          background: "rgba(255, 255, 255, 0.1)",
          color: "white",
          "font-size": "13px",
          outline: "none",
          "box-sizing": "border-box",
        }}
      />
      <div
        style={{
          display: "flex",
          gap: "8px",
          "margin-top": "8px",
        }}
      >
        <button
          onClick={props.onUseImage}
          style={{
            flex: 1,
            padding: "6px 12px",
            "border-radius": "6px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(79, 189, 187, 0.3)",
            color: "white",
            "font-size": "12px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Use Image
        </button>
        <button
          onClick={props.onUseGradient}
          style={{
            flex: 1,
            padding: "6px 12px",
            "border-radius": "6px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: !props.useImage
              ? "rgba(79, 189, 187, 0.3)"
              : "rgba(255, 255, 255, 0.1)",
            color: "white",
            cursor: "pointer",
            "font-size": "12px",
            transition: "all 0.2s",
          }}
        >
          Use Gradient
        </button>
      </div>
    </div>
  );
};

export default ImageUrlInput;
