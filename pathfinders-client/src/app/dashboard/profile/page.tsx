'use client';

import { useAuth } from '@/contexts/auth-context';
import { ProfileForm } from '@/components/profile/profile-form';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { UserCircle } from '@/components/icons/icons';
import { 
  AtSign, 
  User as UserIcon, 
  Calendar, 
  Award,
  ChevronRight
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="large" />
      </div>
    );
  }

  if (!user) return null;

  const accountItems = [
    {
      label: 'Username',
      value: user.username,
      icon: UserIcon
    },
    {
      label: 'Email',
      value: user.email,
      icon: AtSign
    },
    {
      label: 'Member Since',
      value: new Date(user.created_at).toLocaleDateString(),
      icon: Calendar
    },
    {
      label: 'Assessments',
      value: `${user.assessment_count} Completed`,
      icon: Award
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <UserCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 
            bg-clip-text text-transparent">
            Profile Settings
          </h1>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-slate-200/50 shadow-lg">
            <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Personal Information
              </h2>
            </div>
            <div className="p-6 bg-white">
              <ProfileForm user={user} />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Details Card */}
          <Card className="overflow-hidden border-slate-200/50 shadow-lg bg-slate-900">
            <div className="border-b border-slate-700/50 bg-slate-800/50 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Account Details
              </h2>
            </div>
            <div className="divide-y divide-slate-700/50">
              {accountItems.map((item) => (
                <div 
                  key={item.label}
                  className="flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="p-2 bg-slate-700/50 rounded-lg">
                    <item.icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-400">
                      {item.label}
                    </p>
                    <p className="text-white truncate">
                      {item.value}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}