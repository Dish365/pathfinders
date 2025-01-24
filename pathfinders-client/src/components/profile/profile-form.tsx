'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Mail, User as UserIcon, Calendar, FileText } from 'lucide-react';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    birth_date: '',
  });

  useEffect(() => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      bio: user.profile.bio || '',
      birth_date: user.profile.birth_date || '',
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputWrapperClass = "relative";
  const inputClass = [
    "mt-1 block w-full rounded-lg border border-slate-200",
    "px-4 py-2.5 pl-11 bg-white text-slate-800",
    "shadow-sm transition-all duration-200",
    "placeholder:text-slate-400",
    "focus:border-indigo-500 focus:ring-2",
    "focus:ring-indigo-500/20 focus:outline-none"
  ].join(" ");
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";
  const iconClass = "absolute left-3 top-[2.4rem] h-5 w-5 text-slate-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={inputWrapperClass}>
          <label htmlFor="first_name" className={labelClass}>
            First Name
          </label>
          <UserIcon className={iconClass} />
          <input
            type="text"
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className={inputClass}
            placeholder="John"
          />
        </div>

        <div className={inputWrapperClass}>
          <label htmlFor="last_name" className={labelClass}>
            Last Name
          </label>
          <UserIcon className={iconClass} />
          <input
            type="text"
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className={inputClass}
            placeholder="Doe"
          />
        </div>
      </div>

      <div className={inputWrapperClass}>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <Mail className={iconClass} />
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={inputClass}
          placeholder="john.doe@example.com"
        />
      </div>

      <div className={inputWrapperClass}>
        <label htmlFor="bio" className={labelClass}>
          Bio
        </label>
        <FileText className={iconClass} />
        <textarea
          id="bio"
          rows={4}
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className={`${inputClass} pl-11 resize-none`}
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className={inputWrapperClass}>
        <label htmlFor="birth_date" className={labelClass}>
          Birth Date
        </label>
        <Calendar className={iconClass} />
        <input
          type="date"
          id="birth_date"
          value={formData.birth_date}
          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
          className={inputClass}
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className={[
            "w-full flex justify-center items-center gap-2 py-2.5 px-4",
            "rounded-lg shadow-sm text-sm font-medium text-white",
            "transition-all duration-200",
            loading 
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100/50 hover:shadow-lg",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          ].join(" ")}
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Saving Changes...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}