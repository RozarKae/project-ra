import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Lock, Mail, Compass, Database } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { user, login, loading, isMock } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      toast.success(
        isMock 
          ? 'Logged in successfully (Offline Sandbox Mode)!' 
          : 'Welcome back! Live session initialized.'
      );
      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] font-poppins flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Premium Cinematic Background Nodes */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#0F6D5B]/5 filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#D4AF37]/5 filter blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 border border-[#D4AF37]/15 shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
      >
        
        {/* Brand Insignia */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 flex items-center justify-center mb-4">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full fill-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] animate-[spin_20s_linear_infinite]"
            >
              <path d="M50,15 A35,35 0 1,0 85,50 A25,25 0 1,1 50,15" />
            </svg>
          </div>
          <h1 className="font-cinzel text-xl tracking-[0.15em] text-[#D4AF37] font-bold text-center">
            NIKAHZWEDOS
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-[#0F6D5B] font-semibold mt-1">
            Secure Administrator Login
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Email input group */}
          <Input
            type="email"
            label="Email Address"
            placeholder="admin@projectra.com"
            error={errors.email?.message}
            icon={<Mail size={16} />}
            {...register('email')}
          />

          {/* Password input group */}
          <Input
            type="password"
            label="Security Password"
            placeholder="••••••••"
            error={errors.password?.message}
            icon={<Lock size={16} />}
            {...register('password')}
          />

          {/* Submit button */}
          <Button
            type="submit"
            variant="secondary"
            isLoading={loading}
            className="w-full uppercase text-xs tracking-wider"
          >
            Establish Session
          </Button>

        </form>

        {/* Environment Status Badge */}
        <div className="mt-8 pt-6 border-t border-[#D4AF37]/10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] text-[#F5F5F5]/50 bg-[#141414] border border-[#D4AF37]/5 px-4 py-2 rounded-full">
            <Database size={12} className={isMock ? 'text-amber-500' : 'text-[#0F6D5B]'} />
            <span>
              {isMock 
                ? 'Offline Sandbox: Enter any valid credentials' 
                : 'Firebase Enabled: Use registered credentials'}
            </span>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-[#0F6D5B] hover:text-[#148C75] transition font-semibold"
          >
            <Compass size={14} />
            <span>Return to Public Invitation</span>
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
