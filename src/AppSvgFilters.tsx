import { type Component, Show } from "solid-js";

interface SvgFiltersProps {
  filterId: string;
  dataURL: string;
  circleSize: number;
  scale: number;
  // Header filter props
  headerFilterId?: string;
  headerDataURL?: string;
  headerWidth?: number;
  headerHeight?: number;
}

const SvgFilters: Component<SvgFiltersProps> = (props) => {
  return (
    <svg
      color-interpolation-filters="sRGB"
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        {/* Circle Displacement filter */}
        <filter
          id={props.filterId}
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="1"
          height="1"
        >
          <feImage
            href={props.dataURL}
            x="0"
            y="0"
            width={props.circleSize}
            height={props.circleSize}
            result="displacementMap"
            preserveAspectRatio="none"
          />
          <feDisplacementMap
            id="disp"
            in="SourceGraphic"
            in2="displacementMap"
            scale={props.scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0" />
        </filter>

        {/* Header displacement filter */}
        <Show when={props.headerFilterId && props.headerDataURL}>
          <filter
            id={props.headerFilterId}
            filterUnits="objectBoundingBox"
            primitiveUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1"
            height="1"
          >
            <feImage
              href={props.headerDataURL}
              x="0"
              y="0"
              width={props.headerWidth || 800}
              height={props.headerHeight || 80}
              result="displacementMap"
              preserveAspectRatio="none"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacementMap"
              scale={props.scale * 0.5}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="0" />
          </filter>
        </Show>

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
        <linearGradient id="doubleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ece0c5" />
          <stop offset="50%" stop-color="#AFBDBB" />
          <stop offset="100%" stop-color="#c9e8e8" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SvgFilters;
