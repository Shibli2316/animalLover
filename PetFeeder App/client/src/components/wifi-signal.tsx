interface WiFiSignalProps {
  rssi: number;
  className?: string;
}

export function WiFiSignal({ rssi, className = "" }: WiFiSignalProps) {
  const getSignalStrength = (rssi: number) => {
    if (rssi >= -50) return { bars: 4, color: "signal-excellent", label: "Excellent" };
    if (rssi >= -60) return { bars: 3, color: "signal-good", label: "Very Good" };
    if (rssi >= -70) return { bars: 2, color: "signal-fair", label: "Good" };
    if (rssi >= -80) return { bars: 1, color: "signal-poor", label: "Fair" };
    return { bars: 0, color: "signal-poor", label: "Poor" };
  };

  const signal = getSignalStrength(rssi);

  return (
    <div className={`flex items-end space-x-0.5 ${signal.color} ${className}`}>
      <div className={`signal-bar h-2 ${signal.bars >= 1 ? 'opacity-100' : 'opacity-30'}`} />
      <div className={`signal-bar h-3 ${signal.bars >= 2 ? 'opacity-100' : 'opacity-30'}`} />
      <div className={`signal-bar h-4 ${signal.bars >= 3 ? 'opacity-100' : 'opacity-30'}`} />
      <div className={`signal-bar h-5 ${signal.bars >= 4 ? 'opacity-100' : 'opacity-30'}`} />
    </div>
  );
}
