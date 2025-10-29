const REFRACTIVE_INDEX_AIR = 1.0;
const REFRACTIVE_INDEX_GLASS = 1.5;

// Surface function: Convex Squircle
// Input: x (0 to 1, where 0 = edge, 1 = center/flat part)
// Output: height of glass surface
export function calcSurfaceHeight(x: number): number {
  return (1 - Math.pow(1 - x, 4)) ** 0.25;
}

function calcDerivative(x: number, delta = 0.001): number {
  const x1 = Math.max(0, x - delta);
  const x2 = Math.min(1, x + delta);
  const y1 = calcSurfaceHeight(x1);
  const y2 = calcSurfaceHeight(x2);

  return (y2 - y1) / (2 * delta);
}

// Snell's Law: Calculate refraction angle
// Input: incidentAngle (radians), n1, n2 (refractive indices)
// Output: refracted angle (radians)
function snellsLaw(incidentAngle: number, n1: number, n2: number): number {
  const sinTheta2 = (n1 / n2) * Math.sin(incidentAngle);
  return Math.asin(sinTheta2);
}

// Main function: Calculate displacement at distance from edge
// Input: normalizedDistance (0 = edge, 1 = flat center)
//        glassThickness (in pixels)
// Output: displacement magnitude (in pixels)
export function calculateDisplacement(
  normalizedDistance: number,
  glassThickness: number,
): number {
  const height = calcSurfaceHeight(normalizedDistance);
  const slope = calcDerivative(normalizedDistance);
  const normal = { x: -slope, y: 1 }; // Rotated -90°

  const length = Math.sqrt(normal.x ** 2 + normal.y ** 2);
  normal.x /= length;
  normal.y /= length;

  const incident = { x: 0, y: -1 };
  const dotProduct = incident.x * normal.x + incident.y * normal.y;
  const incidentAngle = Math.acos(-dotProduct); // acos of dot product

  const refractedAngle = snellsLaw(
    incidentAngle,
    REFRACTIVE_INDEX_AIR,
    REFRACTIVE_INDEX_GLASS,
  );

  const actualThickness = height * glassThickness;
  const displacement =
    actualThickness * Math.tan(refractedAngle - incidentAngle);

  return Math.abs(displacement);
}

export interface DisplacementData {
  displacements: number[];
  maxDisplacement: number;
}

// Generate displacement array along one radius
// samples: number of points to sample (127 recommended for 8-bit precision)
// bezelWidth: how much of the radius is the curved bezel (0 to 1, e.g. 0.3 = 30%)
// glassThickness: physical thickness in pixels
export function generateDisplacementArray(
  samples: number,
  bezelWidth: number,
  glassThickness: number,
): DisplacementData {
  const displacements: number[] = [];

  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);

    let displacement = 0;
    if (t <= bezelWidth) {
      const normalizedDistance = t / bezelWidth;
      displacement = calculateDisplacement(normalizedDistance, glassThickness);

      // Log first few and any non-zero values
      if (i < 5 || Math.abs(displacement) > 0.001) {
        console.log(`Sample ${i} (t=${t.toFixed(3)}):`, {
          normalizedDistance: normalizedDistance.toFixed(3),
          displacement: displacement.toFixed(4),
        });
      }
    }

    displacements.push(displacement);
  }

  // Find maximum displacement for normalization
  const maxDisplacement = Math.max(...displacements);

  return { displacements, maxDisplacement };
}

// Convert displacement array to 2D image data
// size: width/height of square image (power of 2 recommended, e.g. 256)
// radius: radius of circle in pixels
// data: output from generateDisplacementArray
export function createDisplacementMap(
  size: number,
  radius: number,
  data: DisplacementData,
): ImageData {
  const imageData = new ImageData(size, size);
  const center = size / 2;

  const NORMALIZATION_FACTOR = 50; // Adjust this to taste
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const pixelIndex = (y * size + x) * 4;

      const dx = x - center;
      const dy = y - center;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let r = 128,
        g = 128;

      if (distance <= radius) {
        const distanceFromEdge = radius - distance;
        const normalizedDistance = distanceFromEdge / radius;
        const sampleIndex = Math.floor(
          normalizedDistance * (data.displacements.length - 1),
        );
        const displacementMagnitude = data.displacements[sampleIndex];

        // Use fixed normalization instead of data.maxDisplacement
        const normalizedMagnitude =
          displacementMagnitude / NORMALIZATION_FACTOR;

        const angle = Math.atan2(dy, dx);
        const displacementX = -Math.cos(angle) * normalizedMagnitude;
        const displacementY = -Math.sin(angle) * normalizedMagnitude;

        r = Math.round(128 + displacementX * 127);
        g = Math.round(128 + displacementY * 127);

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
      }

      imageData.data[pixelIndex + 0] = r;
      imageData.data[pixelIndex + 1] = g;
      imageData.data[pixelIndex + 2] = 128;
      imageData.data[pixelIndex + 3] = 255;
    }
  }

  return imageData;
}

// Helper: Convert ImageData to data URL for use in SVG
export function imageDataToDataURL(imageData: ImageData): string {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

export function createRoundedRectDisplacementMap(
  width: number,
  height: number,
  borderRadius: number,
  displacementData: ReturnType<typeof generateDisplacementArray>,
): ImageData {
  const imageData = new ImageData(width, height);

  const R = borderRadius;
  const halfH = height / 2;
  const cy = halfH;
  const leftCx = R;
  const rightCx = width - R;

  const NORMALIZATION_FACTOR = 50; // same as circle map, tune to taste
  const samples = displacementData.displacements.length;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4;

      // Determine whether we're inside the pill
      // Inside if:
      // - in the central rectangle band (R <= x <= width - R)
      // - or inside either cap circle
      const dxL = x - leftCx;
      const dxR = x - rightCx;
      const dy = y - cy;

      const inCentralBand = x >= R && x <= width - R;
      const inLeftDisk = dxL * dxL + dy * dy <= R * R;
      const inRightDisk = dxR * dxR + dy * dy <= R * R;

      const inside = inCentralBand || inLeftDisk || inRightDisk;

      // Default: no displacement outside
      let r = 128;
      let g = 128;

      if (inside) {
        // Candidates: distance to top, bottom, left cap arc, right cap arc
        // We'll pick the nearest boundary and use its inward normal.
        let bestDist = Infinity;
        let nx = 0;
        let ny = 0;
        let denom = halfH; // default if we pick top/bottom

        // Top edge (y = 0), inward normal is +Y
        const dTop = y;
        if (dTop < bestDist) {
          bestDist = dTop;
          nx = 0;
          ny = 1;
          denom = halfH;
        }

        // Bottom edge (y = height), inward normal is -Y
        const dBottom = height - 1 - y; // pixel-centered; you can also use (height - y)
        if (dBottom < bestDist) {
          bestDist = dBottom;
          nx = 0;
          ny = -1;
          denom = halfH;
        }

        // Left cap (circle of radius R centered at (R, cy))
        const dL = Math.hypot(dxL, dy);
        const dLeftToArc = Math.abs(R - dL); // distance to the circle boundary
        if (dLeftToArc < bestDist) {
          bestDist = dLeftToArc;
          denom = R;
          const len = dL || 1;
          // Inward normal = toward circle center
          nx = -(dxL / len);
          ny = -(dy / len);
        }

        // Right cap (circle of radius R centered at (width - R, cy))
        const dR = Math.hypot(dxR, dy);
        const dRightToArc = Math.abs(R - dR);
        if (dRightToArc < bestDist) {
          bestDist = dRightToArc;
          denom = R;
          const len = dR || 1;
          nx = -(dxR / len);
          ny = -(dy / len);
        }

        // Convert distance to normalized 0..1 from edge to "center"
        const normalizedDistance = clamp(bestDist / denom, 0, 1);

        // Sample the displacement magnitude profile
        const idx = Math.floor(normalizedDistance * (samples - 1));
        const magnitude = displacementData.displacements[idx] || 0;

        // Normalize magnitude to -1..1 space we encode into RG
        const normalizedMagnitude = magnitude / NORMALIZATION_FACTOR;

        // Apply inward normal
        const dispX = nx * normalizedMagnitude;
        const dispY = ny * normalizedMagnitude;

        r = Math.round(clamp(128 + dispX * 127, 0, 255));
        g = Math.round(clamp(128 + dispY * 127, 0, 255));
      }

      imageData.data[pixelIndex + 0] = r;
      imageData.data[pixelIndex + 1] = g;
      imageData.data[pixelIndex + 2] = 128; // neutral blue
      imageData.data[pixelIndex + 3] = 255; // opaque
    }
  }

  return imageData;
}
