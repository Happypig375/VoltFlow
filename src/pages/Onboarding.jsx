import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, ChevronRight, Car, IdCard, Battery } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EV_MODELS = [
  { label: 'Tesla Model 3', battery: 60 },
  { label: 'Tesla Model Y', battery: 75 },
  { label: 'Tesla Model S', battery: 100 },
  { label: 'Nissan Leaf', battery: 40 },
  { label: 'Chevrolet Bolt EV', battery: 66 },
  { label: 'Hyundai Ioniq 5', battery: 77 },
  { label: 'Ford Mustang Mach-E', battery: 91 },
  { label: 'BMW iX3', battery: 80 },
  { label: 'Volkswagen ID.4', battery: 82 },
  { label: 'Kia EV6', battery: 77 },
  { label: 'Other', battery: 0 },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    staff_id: '',
    ev_type: '',
    ev_battery_size_kwh: '',
    connector_preference: '',
  });

  const handleEvSelect = (value) => {
    const model = EV_MODELS.find(m => m.label === value);
    setForm(prev => ({
      ...prev,
      ev_type: value,
      ev_battery_size_kwh: model && model.battery > 0 ? model.battery : prev.ev_battery_size_kwh,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateUser({
      ...form,
      ev_battery_size_kwh: Number(form.ev_battery_size_kwh),
      onboarding_complete: true,
    });
    setSaving(false);
    navigate('/');
  };

  const canProceedStep0 = form.staff_id.trim().length > 0;
  const canProceedStep1 = form.ev_type && form.ev_battery_size_kwh > 0 && form.connector_preference;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold">ChargeSmart</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Let's set up your profile to get started
        </p>

        {/* Progress */}
        <div className="flex gap-2 mt-6">
          {[0, 1].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-accent" />
                  Staff Information
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Enter your company staff ID</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff_id">Staff ID</Label>
                <Input
                  id="staff_id"
                  placeholder="e.g. EMP-12345"
                  value={form.staff_id}
                  onChange={e => setForm({ ...form, staff_id: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
                  <Car className="w-5 h-5 text-accent" />
                  EV Information
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Tell us about your electric vehicle</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>EV Model</Label>
                  <Select value={form.ev_type} onValueChange={handleEvSelect}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your EV" />
                    </SelectTrigger>
                    <SelectContent>
                      {EV_MODELS.map(m => (
                        <SelectItem key={m.label} value={m.label}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="battery" className="flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5" />
                    Battery Size (kWh)
                  </Label>
                  <Input
                    id="battery"
                    type="number"
                    placeholder="e.g. 75"
                    value={form.ev_battery_size_kwh}
                    onChange={e => setForm({ ...form, ev_battery_size_kwh: e.target.value })}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Connector Type</Label>
                  <Select value={form.connector_preference} onValueChange={v => setForm({ ...form, connector_preference: v })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select connector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CCS">CCS</SelectItem>
                      <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
                      <SelectItem value="Type2">Type 2</SelectItem>
                      <SelectItem value="Tesla">Tesla</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 pt-4">
        <div className="flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="h-12 px-6"
            >
              Back
            </Button>
          )}
          {step === 0 && (
            <Button
              onClick={() => setStep(1)}
              disabled={!canProceedStep0}
              className="h-12 flex-1 font-semibold"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {step === 1 && (
            <Button
              onClick={handleSave}
              disabled={!canProceedStep1 || saving}
              className="h-12 flex-1 font-semibold"
            >
              {saving ? 'Saving...' : 'Get Started'}
              <Zap className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}