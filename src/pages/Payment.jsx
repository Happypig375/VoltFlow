import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Check, Zap, Clock, BadgePercent, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const planLabels = {
  eager: { icon: Zap, label: 'Fast Charge', color: 'text-accent' },
  discount_1: { icon: Clock, label: 'Flex Charge', color: 'text-primary' },
  discount_2: { icon: BadgePercent, label: 'Eco Charge', color: 'text-purple-600' },
};

export default function Payment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const urlParams = new URLSearchParams(window.location.search);

  const chargerId = urlParams.get('chargerId');
  const plan = urlParams.get('plan');
  const currentSoc = urlParams.get('currentSoc');
  const desiredSoc = urlParams.get('desiredSoc');
  const discount = urlParams.get('discount');
  const duration = urlParams.get('duration');
  const cost = urlParams.get('cost');

  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const planInfo = planLabels[plan] || planLabels.eager;
  const PlanIcon = planInfo.icon;

  const formatCardNumber = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length > 2) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    return cleaned;
  };

  const handlePayment = async () => {
    setProcessing(true);

    // Simulate payment processing
    await new Promise(r => setTimeout(r, 1500));

    // Create charging session record
    await base44.entities.ChargingSession.create({
      charger_id: chargerId,
      current_soc: Number(currentSoc),
      desired_soc: Number(desiredSoc),
      ev_type: user?.ev_type || '',
      battery_size_kwh: user?.ev_battery_size_kwh || 0,
      selected_plan: plan,
      discount_percent: Number(discount),
      estimated_duration_hours: Number(duration),
      estimated_cost: Number(cost),
      status: 'charging',
      payment_status: 'paid',
    });

    setProcessing(false);
    setSuccess(true);

    toast({
      title: 'Payment successful!',
      description: 'Your charging session has started.',
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 text-primary" strokeWidth={3} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="font-heading text-2xl font-bold">Charging Started!</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your {planInfo.label} session is now active
          </p>
          <div className="bg-card border border-border rounded-2xl p-5 mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{planInfo.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Charge Level</span>
              <span className="font-medium">{currentSoc}% → {desiredSoc}%</span>
            </div>
            {Number(discount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-primary">{discount}% off</span>
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-medium">Total Paid</span>
              <span className="font-heading font-bold text-lg">${Number(cost).toFixed(2)}</span>
            </div>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="w-full h-12 mt-6 font-semibold"
          >
            Back to Map
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading font-bold text-lg">Payment</h1>
            <p className="text-xs text-muted-foreground">Complete your charging session</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h2 className="font-heading font-semibold text-sm mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className={`p-2 rounded-lg bg-muted`}>
                <PlanIcon className={`w-4 h-4 ${planInfo.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{planInfo.label}</p>
                <p className="text-xs text-muted-foreground">
                  {currentSoc}% → {desiredSoc}%
                </p>
              </div>
              {Number(discount) > 0 && (
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-medium">Total</span>
              <span className="font-heading font-bold text-xl">${Number(cost).toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-heading font-semibold text-sm">Card Details</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="card">Card Number</Label>
            <Input
              id="card"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              className="h-12 text-base font-mono tracking-wider"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                className="h-12 text-base font-mono"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                type="password"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="h-12 text-base font-mono"
                maxLength={4}
              />
            </div>
          </div>
        </motion.div>

        {/* Security notice */}
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <p className="text-xs text-muted-foreground">
            Your payment is encrypted and secure
          </p>
        </div>

        <Button
          onClick={handlePayment}
          disabled={processing || !cardNumber || !expiry || !cvv}
          className="w-full h-14 font-semibold text-base"
        >
          {processing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            `Pay $${Number(cost).toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
}