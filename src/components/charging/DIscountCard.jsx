import { cn } from '@/lib/utils';
import { Zap, Clock, BadgePercent } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DiscountCard({ plan, isSelected, onSelect, index }) {
  const icons = {
    eager: Zap,
    discount_1: Clock,
    discount_2: BadgePercent,
  };
  const Icon = icons[plan.id] || Zap;

  const accentStyles = {
    eager: 'border-accent bg-accent/5',
    discount_1: 'border-primary bg-primary/5',
    discount_2: 'border-chart-3 bg-purple-50',
  };

  const tagStyles = {
    eager: 'bg-accent/10 text-accent',
    discount_1: 'bg-primary/10 text-primary',
    discount_2: 'bg-purple-100 text-purple-700',
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onSelect(plan)}
      className={cn(
        "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200",
        isSelected
          ? `${accentStyles[plan.id]} shadow-lg scale-[1.02]`
          : "border-border bg-card hover:border-muted-foreground/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-xl",
          isSelected ? tagStyles[plan.id] : "bg-muted"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-semibold text-sm">{plan.title}</h3>
            {plan.discount > 0 && (
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", tagStyles[plan.id])}>
                -{plan.discount}%
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{plan.duration}</span>
            </div>
            <p className="font-heading font-bold text-lg">
              ${plan.cost.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}