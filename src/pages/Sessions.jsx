import { useAuth } from '@/lib/AuthContext';
import { getUserSessions } from '@/api/entities/chargingSession';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Battery } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusStyles = {
  charging: 'bg-primary/10 text-primary',
  completed: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-600',
};

const planNames = {
  eager: 'Fast Charge',
  discount_1: 'Flex Charge',
  discount_2: 'Eco Charge',
};

export default function Sessions() {
  const { user } = useAuth();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', user?.email],
    queryFn: () => getUserSessions(user.email),
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-12 pb-4">
        <h1 className="font-heading text-2xl font-bold">Sessions</h1>
        <p className="text-sm text-muted-foreground mt-1">Your charging history</p>
      </div>

      <div className="px-4 space-y-3 pb-6">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && sessions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No charging sessions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start a session from the map</p>
          </div>
        )}

        {sessions.map((session, i) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{session.charger_name || `Charger #${session.charger_id}`}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session.created_date && format(new Date(session.created_date), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </div>
              <Badge className={statusStyles[session.status] || 'bg-muted text-muted-foreground'}>
                {session.status}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <Battery className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">{session.current_soc}% → {session.desired_soc}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">{planNames[session.selected_plan] || session.selected_plan}</span>
              </div>
              <div className="text-right">
                <span className="font-heading font-bold text-sm">${session.estimated_cost?.toFixed(2)}</span>
                {session.discount_percent > 0 && (
                  <span className="text-[10px] text-primary font-medium ml-1">-{session.discount_percent}%</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}