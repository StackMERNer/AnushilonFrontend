'use client';

import { PressableButton } from '@/components/ui/pressable-button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { apiClient } from '@/lib/api/api-client';
import { createUserService } from '@/services/user.service';
import { IUser } from '@/types/user';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface InstituteFormProps {
  institute: {
    name: string;
    type: string;
    address: string;
    phone: string;
  };
  onSubmit: (instituteData: any) => Promise<void>;
  isSubmitting: boolean;
}

const InstituteForm = ({
  institute,
  onSubmit,
  isSubmitting,
}: InstituteFormProps) => {
  const [instituteData, setInstituteData] = useState({
    name: institute.name,
    type: institute.type,
    phone: institute.phone,
    address: institute.address,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setInstituteData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(instituteData);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-6 border relative">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            প্রতিষ্ঠানের তথ্য
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Institute Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                প্রতিষ্ঠানের নাম{' '}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="name"
                required
                value={instituteData.name}
                onChange={handleChange}
                placeholder="প্রতিষ্ঠানের নাম"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Institute Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                প্রতিষ্ঠানের ধরন{' '}
                <span className="text-red-500">*</span>
              </label>

              <select
                name="type"
                required
                value={instituteData.type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="">প্রতিষ্ঠানের ধরন</option>
                <option value="coaching">কোচিং সেন্টার</option>
                <option value="school">স্কুল</option>
                <option value="college">কলেজ</option>
                <option value="others">অন্যান্য</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ফোন নম্বর
              </label>

              <input
                type="tel"
                name="phone"
                placeholder="013xxxxxxxx"
                value={instituteData.phone}
                minLength={11}
                maxLength={11}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                প্রতিষ্ঠানের ঠিকানা
              </label>

              <input
                type="text"
                name="address"
                value={instituteData.address}
                onChange={handleChange}
                placeholder="ঠিকানা"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <PressableButton
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
              </PressableButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const MyInstitute = () => {
  const { data: user, isLoading, refetch } = useUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        লোডিং...
      </div>
    );
  }

  if (!user?.institute) {
    return (
      <div className="p-6 text-center text-gray-500">
        প্রতিষ্ঠানের তথ্য পাওয়া যায়নি।
      </div>
    );
  }


  const handleSubmit = async (data: IUser['institute']) => {
    setIsSubmitting(true);
    const userService = createUserService(apiClient);
    try {
      await userService.updateProfile({ institute: data });
      toast.success('প্রতিষ্ঠানের তথ্য সফলভাবে আপডেট হয়েছে');
      await refetch();
    } catch (error) {
      console.error('Failed to update institute details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InstituteForm
      key={`${user.institute.name}-${user.institute.type}-${user.institute.address}`}
      institute={user.institute}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default MyInstitute;