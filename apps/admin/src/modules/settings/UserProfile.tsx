import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Upload, 
  Trash2, 
  Globe, 
  Shield, 
  Lock, 
  Sliders, 
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, Button } from '@project-ra/ui';
import { toast } from 'react-hot-toast';
import { useUserProfile } from '@project-ra/shared';
import { useAuth, isFirebaseConfigured, storage, auth } from '@project-ra/firebase';
import { UserProfileData } from '@project-ra/types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export const UserProfile: React.FC = () => {
  const { profile, loading, saveProfile } = useUserProfile();
  const { user } = useAuth();
  
  const currentUserEmail = user?.email || 'admin@projectra.com';

  // Personal Information states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  // Branding Profile Photo
  const [photoURL, setPhotoURL] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Contact Information states
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [timezone, setTimezone] = useState('UTC+05:30');
  const [language, setLanguage] = useState('en');

  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Read Only Account states
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('owner');
  const [workspaceId, setWorkspaceId] = useState('default_workspace');
  const [createdAt, setCreatedAt] = useState('');
  const [lastLogin, setLastLogin] = useState('');
  const [emailVerified, setEmailVerified] = useState(true);

  // Personal Preferences states
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [compactMode, setCompactMode] = useState(false);
  const [animationPreference, setAnimationPreference] = useState<'full' | 'reduced'>('full');

  // Submit / Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Photo Input Ref
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Seed form values from database profile hook
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setPhotoURL(profile.photoURL || '');

      setPhone(profile.phone || '');
      setCountry(profile.country || 'India');
      setTimezone(profile.timezone || 'UTC+05:30');
      setLanguage(profile.language || 'en');

      setUserId(profile.userId || '');
      setRole(profile.role || 'owner');
      setWorkspaceId(profile.workspaceId || 'default_workspace');
      setCreatedAt(profile.createdAt || new Date().toISOString());
      setLastLogin(profile.lastLogin || new Date().toISOString());
      setEmailVerified(profile.emailVerified ?? true);

      setTheme(profile.theme || 'dark');
      setCompactMode(profile.compactMode ?? false);
      setAnimationPreference(profile.animationPreference || 'full');
    }
  }, [profile]);

  // Check if form is dirty
  const isDirty = (): boolean => {
    if (!profile) return false;

    return (
      firstName !== (profile.firstName || '') ||
      lastName !== (profile.lastName || '') ||
      displayName !== (profile.displayName || '') ||
      bio !== (profile.bio || '') ||
      photoFile !== null ||
      photoURL !== (profile.photoURL || '') ||
      phone !== (profile.phone || '') ||
      country !== (profile.country || 'India') ||
      timezone !== (profile.timezone || 'UTC+05:30') ||
      language !== (profile.language || 'en') ||
      theme !== (profile.theme || 'dark') ||
      compactMode !== (profile.compactMode ?? false) ||
      animationPreference !== (profile.animationPreference || 'full')
    );
  };

  // Revert changes
  const handleCancel = () => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setPhotoURL(profile.photoURL || '');
      setPhotoFile(null);
      setPhone(profile.phone || '');
      setCountry(profile.country || 'India');
      setTimezone(profile.timezone || 'UTC+05:30');
      setLanguage(profile.language || 'en');
      setTheme(profile.theme || 'dark');
      setCompactMode(profile.compactMode ?? false);
      setAnimationPreference(profile.animationPreference || 'full');
      toast.success('Profile changes reverted.');
    }
  };

  // Image Upload Validations
  const validatePhoto = (file: File): boolean => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported photo format. Please upload PNG, JPEG, or WEBP images.');
      return false;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Photo size exceeds the 5MB maximum limit.');
      return false;
    }
    return true;
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validatePhoto(file)) {
        setPhotoFile(file);
        setPhotoURL(URL.createObjectURL(file));
      }
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoURL('');
    if (photoInputRef.current) photoInputRef.current.value = '';
    toast.success('Photo removed from preview. Click Save Changes to commit.');
  };

  // File Upload Helper
  const uploadPhotoFile = async (file: File): Promise<string> => {
    if (isFirebaseConfigured && storage) {
      const storagePath = `users/${userId}/profile/photo_${Date.now()}`;
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } else {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  };

  // Save changes handler
  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!displayName.trim()) {
      toast.error('Display Name is required.');
      return;
    }

    if (phone.trim()) {
      const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        toast.error('Invalid phone format (min 7 digits).');
        return;
      }
    }

    setIsSaving(true);
    let finalPhotoURL = photoURL;

    try {
      if (photoFile) {
        finalPhotoURL = await uploadPhotoFile(photoFile);
        toast.success('Photo uploaded successfully.');
      } else if (photoURL === '') {
        toast.success('Photo removed.');
      }

      const payload: UserProfileData = {
        userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        photoURL: finalPhotoURL || undefined,
        phone: phone.trim() || undefined,
        country,
        timezone,
        language,
        theme,
        compactMode,
        animationPreference,
        createdAt,
        lastLogin,
        emailVerified,
        role,
        workspaceId,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUserEmail
      };

      await saveProfile(payload);
      setPhotoFile(null);
      toast.success('Profile updated successfully.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Password strength visual helper
  const getPasswordStrength = (pass: string): { label: string; color: string; width: string } => {
    if (!pass) return { label: 'Empty', color: 'bg-zinc-800', width: 'w-0' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    if (score <= 3) return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  // Change Password handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to change your password?');
    if (!confirmed) return;

    setIsChangingPassword(true);
    try {
      if (isFirebaseConfigured && auth && auth.currentUser) {
        const userObj = auth.currentUser;
        if (userObj.email) {
          const credential = EmailAuthProvider.credential(userObj.email, currentPassword);
          await reauthenticateWithCredential(userObj, credential);
          await updatePassword(userObj, newPassword);
        }
      }
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update credentials.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const strength = getPasswordStrength(newPassword);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 space-y-3 font-poppins">
        <Loader2 className="animate-spin text-[#D4AF37]" size={28} />
        <p className="text-xs">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-poppins relative">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D4AF37]/10 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-cinzel text-[#F5F5F5] font-bold tracking-wide">
            My Profile
          </h1>
          <p className="text-xs text-[#F5F5F5]/50">
            Manage your personal profile, credentials, and accessibility preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column 1: Personal & Photo */}
        <div className="space-y-6">
          
          {/* Card 1: Personal Info */}
          <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3 mb-2">
              <User size={16} className="text-[#D4AF37]" />
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Sarah"
                  disabled={isSaving}
                  className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Jenkins"
                  disabled={isSaving}
                  className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Display Name *</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Sarah J."
                disabled={isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your role or wedding planning profile..."
                rows={3}
                disabled={isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition font-poppins disabled:opacity-40"
              />
            </div>
          </Card>

          {/* Card 2: Profile Photo */}
          <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3 mb-2">
              <Upload size={16} className="text-[#D4AF37]" />
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Profile Picture
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border border-zinc-800 bg-[#090909] overflow-hidden flex items-center justify-center relative shrink-0">
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover animate-fade" />
                ) : (
                  <User className="text-zinc-600" size={24} />
                )}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isSaving}
                    className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5 transition text-[10px] font-bold uppercase tracking-wider disabled:opacity-40"
                  >
                    Upload Photo
                  </button>
                  {photoURL && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={isSaving}
                      className="px-2 py-1.5 rounded-lg border border-red-900/40 text-red-400 hover:bg-red-950/20 transition text-[10px] disabled:opacity-40"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-zinc-500">Supports PNG, JPG, WEBP. Max size: 5MB.</p>
              </div>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </Card>

          {/* Card 3: Contact Info */}
          <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3 mb-2">
              <Globe size={16} className="text-[#D4AF37]" />
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Contact & Localization
              </h3>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Email Address (Read-Only)</label>
              <input
                type="email"
                value={currentUserEmail}
                disabled
                className="w-full text-sm bg-[#090909] border border-zinc-800 text-zinc-500 rounded-xl px-3 py-3 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                disabled={isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={isSaving}
                  className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-40"
                >
                  <option value="India">India</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={isSaving}
                  className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-40"
                >
                  <option value="UTC+05:30">UTC+05:30 (India)</option>
                  <option value="UTC+00:00">UTC+00:00 (GMT)</option>
                  <option value="UTC+04:00">UTC+04:00 (GST)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Default Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-40"
              >
                <option value="en">English (Default)</option>
                <option value="ar">Arabic</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </Card>
        </div>

        {/* Column 2: Security & Account Info */}
        <div className="space-y-6">
          
          {/* Card 4: Security */}
          <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3 mb-2">
              <Shield size={16} className="text-[#D4AF37]" />
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Credentials & Security
              </h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isChangingPassword}
                    className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl pl-3 pr-10 py-3 focus:outline-none transition disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-white"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isChangingPassword}
                    className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl pl-3 pr-10 py-3 focus:outline-none transition disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-white"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-semibold text-zinc-500 uppercase">
                      <span>Strength: <span className="text-[#D4AF37]">{strength.label}</span></span>
                      <span>Min 6 characters</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`}></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isChangingPassword}
                    className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl pl-3 pr-10 py-3 focus:outline-none transition disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-white"
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="py-2 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  {isChangingPassword ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>Change Password</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Card 5: Account Info */}
          <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3 mb-2">
              <Lock size={16} className="text-[#D4AF37]" />
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Account Information
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-[#F5F5F5]/80">
              <div className="flex justify-between py-1 border-b border-[#D4AF37]/5">
                <span className="text-zinc-500 font-semibold uppercase text-[10px]">User ID</span>
                <span className="font-mono text-zinc-400 select-all">{userId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D4AF37]/5">
                <span className="text-zinc-500 font-semibold uppercase text-[10px]">Assigned Role</span>
                <span className="capitalize text-emerald-400 font-semibold">{role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D4AF37]/5">
                <span className="text-zinc-500 font-semibold uppercase text-[10px]">Current Workspace</span>
                <span className="font-mono text-zinc-400">{workspaceId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D4AF37]/5">
                <span className="text-zinc-500 font-semibold uppercase text-[10px]">Account Created</span>
                <span className="font-mono text-zinc-400">{new Date(createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D4AF37]/5">
                <span className="text-zinc-500 font-semibold uppercase text-[10px]">Last Login</span>
                <span className="font-mono text-zinc-400">{new Date(lastLogin).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500 font-semibold uppercase text-[10px]">Email Verified</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  emailVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {emailVerified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 6: Personal Preferences */}
          <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3 mb-2">
              <Sliders size={16} className="text-[#D4AF37]" />
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Personal Preferences
              </h3>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                disabled={isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-40"
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
                <option value="system">System Default</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Interface Animations</label>
              <select
                value={animationPreference}
                onChange={(e) => setAnimationPreference(e.target.value as any)}
                disabled={isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-40"
              >
                <option value="full">Full Animations (Luxury Parallax & Fades)</option>
                <option value="reduced">Reduced Animations (Fast response)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-semibold text-[#F5F5F5] block">Compact Mode</span>
                <span className="text-[10px] text-zinc-500 block">Reduce padding heights inside roster tables.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  disabled={isSaving}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:bg-[#0F6D5B]/30 peer-checked:border-[#0F6D5B] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#D4AF37] after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
              </label>
            </div>
          </Card>

        </div>

        {/* Form Action Controls */}
        <div className="lg:col-span-2 flex justify-end gap-2.5 pt-4 border-t border-[#D4AF37]/10 mb-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={!isDirty() || isSaving}
            className="py-2.5 px-5 text-xs font-semibold"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={!isDirty() || isSaving}
            className="py-2.5 px-6 text-xs font-bold shadow-lg"
          >
            {isSaving ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" />
                <span>Saving Changes...</span>
              </span>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </div>

      </form>

    </div>
  );
};

export default UserProfile;
