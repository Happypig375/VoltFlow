import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { listChargers } from '@/api/entities/charger';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import SocSlider from '@/components/charging/SocSlider';
import DiscountCard from '@/components/charging/DiscountCard';
import { Battery, BatteryFull, Zap, ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RATE_PER_KWH = 0.30; // base rate dollars per kWh

function computeDiscountPlans(currentSoc, desiredSoc, batteryKwh, chargerPowerKw) {
  const energyNeeded = ((desiredSoc - currentSoc) / 100) * batteryKwh;
  if (energyNeeded <= 0) return [];

  const baseCost = energyNeeded * RATE_PER_KWH;
  const fastDuration = energyNeeded / chargerPowerKw;

  // Eager - full speed, no discount
  const eagerPlan = {
    id: 'eager',
    title: 'Fast Charge',
    description: 'Charge as fast as possible with no delay',
    discount: 0,
    duration: `~${Math.max(Math.ceil(fastDuration * 60), 1)} min`,
    durationHours: fastDuration,
    cost: baseCost,
  };

  // Discount 1 - moderate flexibility, moderate discount
  const flex1Hours = Math.max(fastDuration * 2, 2);
  const discount1 = 15;
  const discount1Plan = {
    id: 'discount_1',
    title: 'Flex Charge',
    description: `Fully charged within ${flex1Hours.toFixed(1)} hours`,
    discount: discount1,
    duration: `Within ${flex1Hours.toFixed(1)} hrs`,
    durationHours: flex1Hours,
    cost: baseCost * (1 - discount1 / 100),
  };

  // Discount 2 - maximum flexibility, biggest discount
  const flex2Hours = Math.max(fastDuration * 4, 6);
  const discount2 = 30;
  const discount2Plan = {
    id: 'discount_2',
    title: 'Eco Charge',
    description: `Fully charged within ${flex2Hours.toFixed(1)} hours`,
    discount: discount2,
    duration: `Within ${flex2Hours.toFixed(1)} hrs`,
    durationHours: flex2Hours,
    cost: baseCost * (1 - discount2 / 100),
  };

  return [eagerPlan, discount1Plan, discount2Plan];
}

export default function ChargeSession() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const chargerId = urlParams.get('chargerId');

  const [currentSoc, setCurrentSoc] = useState(30);
  const [desiredSoc, setDesiredSoc] = useState(80);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedChargerId, setSelectedChargerId] = useState(chargerId || '');
  const [step, setStep] = useState('soc'); // soc | plans
  const [computing, setComputing] = useState(false);
  const [plans, setPlans] = useState([]);

  const { data: chargers = [] } = useQuery({
    queryKey: ['chargers'],
    queryFn: listChargers,
  });

  const availableChargers = chargers.filter(c => c.status === 'available');
  const selectedCharger = chargers.find(c => String(c.id) === String(selectedChargerId));

  const handleComputePlans = async () => {
    if (!selectedCharger || !user) return;
    setComputing(true);

    // Simulate brief computation
    await new Promise(r => setTimeout(r, 800));

    const batteryKwh = user.ev_battery_size_kwh || 60;
    const result = computeDiscountPlans(currentSoc, desiredSoc, batteryKwh, selectedCharger.power_kw);
    setPlans(result);
    setStep('plans');
    setComputing(false);
  };

  const handleConfirm = () => {
    if (!selectedPlan) return;
    const params = new URLSearchParams({
      chargerId: selectedChargerId,
      plan: selectedPlan.id,
      currentSoc: String(currentSoc),
      desiredSoc: String(desiredSoc),
      discount: String(selectedPlan.discount),
      duration: String(selectedPlan.durationHours),
      cost: String(selectedPlan.cost.toFixed(2)),
    });
    navigate(`/payment?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => step === 'plans' ? setStep('soc') : navigate('/')} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading font-bold text-lg">
              {step === 'soc' ? 'Charging Setup' : 'Choose Your Plan'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {step === 'soc' ? 'Set your charge levels' : 'Select a charging option'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        <AnimatePresence mode="wait">
          {step === 'soc' && (
            <motion.div
              key="soc"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Charger Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  Select Charger
                </Label>
                <Select value={selectedChargerId} onValueChange={setSelectedChargerId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose a charger" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableChargers.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} — {c.power_kw} kW ({c.connector_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* EV Info Display */}
              {user && (
                <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.ev_type || 'EV'}</p>
                    <p className="text-xs text-muted-foreground">{user.ev_battery_size_kwh || '—'} kWh battery</p>
                  </div>
                </div>
              )}

              {/* SoC Sliders */}
              <div className="bg-card rounded-2xl border border-border p-5 space-y-6">
                <SocSlider
                  label="Current Charge"
                  value={currentSoc}
                  onChange={setCurrentSoc}
                  icon={Battery}
                />
                <div className="border-t border-border" />
                <SocSlider
                  label="Desired Charge"
                  value={desiredSoc}
                  onChange={setDesiredSoc}
                  icon={BatteryFull}
                />
              </div>

              {/* Energy Summary */}
              {user && selectedCharger && (
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Energy needed</span>
                    <span className="font-semibold">
                      {(((desiredSoc - currentSoc) / 100) * (user.ev_battery_size_kwh || 60)).toFixed(1)} kWh
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleComputePlans}
                disabled={!selectedChargerId || desiredSoc <= currentSoc || computing}
                className="w-full h-12 font-semibold text-base"
              >
                {computing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Computing best plans...
                  </>
                ) : (
                  <>
                    View Charging Plans
                    <Zap className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {step === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Summary */}
              <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Charging </span>
                  <span className="font-semibold">{currentSoc}%</span>
                  <span className="text-muted-foreground"> → </span>
                  <span className="font-semibold">{desiredSoc}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedCharger?.name}
                </div>
              </div>

              {/* Plan Cards */}
              <div className="space-y-3">
                {plans.map((plan, i) => (
                  <DiscountCard
                    key={plan.id}
                    plan={plan}
                    index={i}
                    isSelected={selectedPlan?.id === plan.id}
                    onSelect={setSelectedPlan}
                  />
                ))}
              </div>

              <Button
                onClick={handleConfirm}
                disabled={!selectedPlan}
                className="w-full h-12 font-semibold text-base"
              >
                Continue to Payment
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}