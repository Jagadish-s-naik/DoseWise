import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text } from 'react-konva';
import type { Detection } from '../lib/api';
import { Eye, EyeOff } from 'lucide-react';

interface XrayCanvasProps {
  imageUrl: string;
  detections: Detection[];
  onCanvasReady?: (dataUrl: string) => void;
}

export function XrayCanvas({ imageUrl, detections, onCanvasReady }: XrayCanvasProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const stageRef = useRef<any>(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      
      // Calculate dimensions to fit container
      const containerWidth = Math.min(800, window.innerWidth - 100);
      const aspectRatio = img.width / img.height;
      const width = containerWidth;
      const height = width / aspectRatio;
      
      setDimensions({ width, height });
    };
  }, [imageUrl]);

  useEffect(() => {
    if (stageRef.current && onCanvasReady) {
      // Export canvas as data URL for PDF
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      onCanvasReady(dataUrl);
    }
  }, [image, detections, showOverlay, onCanvasReady]);

  const getColorByUrgency = (urgency: string): string => {
    switch (urgency) {
      case 'high':
      case 'urgent':
        return '#DC2626'; // Red
      case 'medium':
      case 'soon':
        return '#F59E0B'; // Yellow
      default:
        return '#10B981'; // Green
    }
  };

  if (!image) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading image...</p>
      </div>
    );
  }

  const scaleX = dimensions.width / image.width;
  const scaleY = dimensions.height / image.height;

  return (
    <div className="relative">
      {/* Toggle Overlay Button */}
      <button
        onClick={() => setShowOverlay(!showOverlay)}
        className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium"
      >
        {showOverlay ? (
          <>
            <EyeOff size={16} />
            Hide Overlays
          </>
        ) : (
          <>
            <Eye size={16} />
            Show Overlays
          </>
        )}
      </button>

      {/* Canvas */}
      <div className="glass-card p-4 inline-block">
        <Stage width={dimensions.width} height={dimensions.height} ref={stageRef}>
          <Layer>
            {/* X-ray Image */}
            <KonvaImage
              image={image}
              width={dimensions.width}
              height={dimensions.height}
            />

            {/* Overlay Annotations */}
            {showOverlay && detections.map((detection, index) => {
              const [x, y, w, h] = detection.bbox;
              const color = getColorByUrgency(detection.urgency);

              // Convert bbox from original image coordinates to scaled coordinates
              const scaledX = (x - w / 2) * scaleX;
              const scaledY = (y - h / 2) * scaleY;
              const scaledW = w * scaleX;
              const scaledH = h * scaleY;

              return (
                <React.Fragment key={index}>
                  {/* Bounding Box */}
                  <Rect
                    x={scaledX}
                    y={scaledY}
                    width={scaledW}
                    height={scaledH}
                    stroke={color}
                    strokeWidth={3}
                    dash={[10, 5]}
                    opacity={0.8}
                  />

                  {/* Tooth Number Label */}
                  <Rect
                    x={scaledX}
                    y={scaledY - 25}
                    width={35}
                    height={20}
                    fill={color}
                    cornerRadius={4}
                    opacity={0.9}
                  />
                  <Text
                    x={scaledX}
                    y={scaledY - 22}
                    width={35}
                    height={20}
                    text={`#${detection.tooth_number}`}
                    fontSize={12}
                    fontStyle="bold"
                    fill="white"
                    align="center"
                    verticalAlign="middle"
                  />
                </React.Fragment>
              );
            })}
          </Layer>
        </Stage>
      </div>

      {/* Color Legend */}
      {showOverlay && (
        <div className="mt-4 glass-card p-4 inline-flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-danger rounded"></div>
            <span className="text-gray-700">Urgent/High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning rounded"></div>
            <span className="text-gray-700">Watch Area/Soon</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success rounded"></div>
            <span className="text-gray-700">Healthy/Routine</span>
          </div>
        </div>
      )}
    </div>
  );
}
