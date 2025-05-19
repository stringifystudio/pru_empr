import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Phone, User } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">You need to be logged in to view this page.</p>
      </div>
    );
  }

  const fullName = user.user_metadata?.full_name || 'N/A';
  const avatarUrl = user.user_metadata?.avatar_url || 'https://via.placeholder.com/100';
  const email = user.email || 'No email available';
  const phone = user.phone || 'No phone number';

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

        <div className="flex flex-col sm:flex-row items-center sm:items-start">
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border mb-4 sm:mb-0 sm:mr-6"
          />
          <div>
            <div className="flex items-center text-lg text-gray-700 mb-2">
              <User className="mr-2 text-gray-500" size={18} />
              <span className="font-semibold">{fullName}</span>
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <Mail className="mr-2 text-gray-500" size={18} />
              <span>{email}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="mr-2 text-gray-500" size={18} />
              <span>{phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
