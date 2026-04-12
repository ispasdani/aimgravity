'use client';

import React from 'react';
import { useSettingsStore } from '@/lib/store/use-settings-store';

export default function Crosshair() {
  const settings = useSettingsStore((state) => state.crosshairSettings);
  
  if (!settings) return null;

  const {
    size,
    thickness,
    gap,
    dot,
    outline,
    outlineThickness,
    color,
    alpha
  } = settings;

  // Render a base element to manage outlines easily if needed
  const renderLine = (styleProps: React.CSSProperties, isHorizontal: boolean) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: color,
      opacity: alpha,
      ...(outline && {
        border: `${outlineThickness}px solid rgba(0,0,0,${alpha})`,
        boxSizing: 'content-box', // Ensure the actual line size is preserved inside the border
      }),
      ...styleProps,
    };
    
    // We adjust the offset for outline so it's centered perfectly
    if (outline) {
      if (isHorizontal) {
        baseStyle.marginTop = `-${outlineThickness}px`;
      } else {
        baseStyle.marginLeft = `-${outlineThickness}px`;
      }
    }

    return <div style={baseStyle} />;
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
      {/* Top Line */}
      {renderLine({
        width: `${thickness}px`,
        height: `${size}px`,
        bottom: `calc(50% + ${gap}px)`,
        left: `calc(50% - ${thickness / 2}px)`,
      }, false)}

      {/* Bottom Line */}
      {renderLine({
        width: `${thickness}px`,
        height: `${size}px`,
        top: `calc(50% + ${gap}px)`,
        left: `calc(50% - ${thickness / 2}px)`,
      }, false)}

      {/* Left Line */}
      {renderLine({
        width: `${size}px`,
        height: `${thickness}px`,
        right: `calc(50% + ${gap}px)`,
        top: `calc(50% - ${thickness / 2}px)`,
      }, true)}

      {/* Right Line */}
      {renderLine({
        width: `${size}px`,
        height: `${thickness}px`,
        left: `calc(50% + ${gap}px)`,
        top: `calc(50% - ${thickness / 2}px)`,
      }, true)}

      {/* Center Dot */}
      {dot && renderLine({
        width: `${thickness}px`,
        height: `${thickness}px`,
        left: `calc(50% - ${thickness / 2}px)`,
        top: `calc(50% - ${thickness / 2}px)`,
      }, true)}
    </div>
  );
}
