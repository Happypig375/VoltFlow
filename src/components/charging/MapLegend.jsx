export default function MapLegend() {
  const items = [
    { color: 'bg-green-500', label: 'Available' },
    { color: 'bg-red-500', label: 'Occupied' },
    { color: 'bg-slate-400', label: 'Offline' },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-border">
      <div className="flex items-center gap-3">
        {items.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}