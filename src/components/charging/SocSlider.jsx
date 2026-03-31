import { Slider } from '@/components/ui/slider';
import { Battery, BatteryFull } from 'lucide-react';

export default function SocSlider({ label, value, onChange, icon: Icon }) {
  const getColor = (val) => {
    if (val < 20) return 'text-red-500';
    if (val < 50) return 'text-amber-500';
    return 'text-primary';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className={`text-2xl font-heading font-bold ${getColor(value)}`}>
          {value}%
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        max={100}
        min={0}
        step={5}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
}