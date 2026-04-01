import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        full_name: fullName.trim(),
        onboarding_complete: false,
        role: 'user',
      });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold">VoltFlow</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          <button
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${mode === 'signin' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => { setMode('signin'); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${mode === 'signup' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === 'signin' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}
            className="space-y-4"
          >
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email/password sign-up is disabled in Firebase Authentication.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
