import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Car, Battery, IdCard, Plug, LogOut, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    staff_id: '',
    ev_type: '',
    ev_battery_size_kwh: '',
    connector_preference: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        staff_id: user.staff_id || '',
        ev_type: user.ev_type || '',
        ev_battery_size_kwh: user.ev_battery_size_kwh || '',
        connector_preference: user.connector_preference || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await updateUser({
      ...form,
      ev_battery_size_kwh: Number(form.ev_battery_size_kwh),
    });
    setSaving(false);
    toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
  };

  const handleLogout = () => {
    logout().then(() => navigate('/login', { replace: true }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-12 pb-4">
        <h1 className="font-heading text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account & EV details</p>
      </div>

      <div className="px-4 space-y-5 pb-6">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center gap-4 mb-5 pb-4 border-b border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-heading font-semibold">{user.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs">
                <IdCard className="w-3 h-3" /> Staff ID
              </Label>
              <Input
                value={form.staff_id}
                onChange={e => setForm({ ...form, staff_id: e.target.value })}
                placeholder="EMP-12345"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs">
                <Car className="w-3 h-3" /> EV Model
              </Label>
              <Input
                value={form.ev_type}
                onChange={e => setForm({ ...form, ev_type: e.target.value })}
                placeholder="Tesla Model 3"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs">
                <Battery className="w-3 h-3" /> Battery Size (kWh)
              </Label>
              <Input
                type="number"
                value={form.ev_battery_size_kwh}
                onChange={e => setForm({ ...form, ev_battery_size_kwh: e.target.value })}
                placeholder="75"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs">
                <Plug className="w-3 h-3" /> Connector Type
              </Label>
              <Select value={form.connector_preference} onValueChange={v => setForm({ ...form, connector_preference: v })}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select" />
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

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 mt-5 font-semibold"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Changes</>
            )}
          </Button>
        </motion.div>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-11 text-destructive hover:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}