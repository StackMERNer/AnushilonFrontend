'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { PressableButton } from '@/components/ui/pressable-button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { apiClient } from '@/lib/api/api-client';
import { createUserService } from '@/services/user.service';
import { IUser } from '@/types/user';

interface InstituteInfoModalProps {
    open: boolean;
    onCompleted: () => void;
    onSkip: () => void;
}

const InstituteInfoModal = ({
    open,
    onCompleted,
    onSkip,
}: InstituteInfoModalProps) => {
    const { refetch } = useUserProfile();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [instituteData, setInstituteData] = useState<
        NonNullable<IUser['institute']>
    >({
        name: '',
        type: '',
        phone: '',
        address: '',
    });

    if (!open) return null;

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

        setIsSubmitting(true);

        try {
            const userService = createUserService(apiClient);

            await userService.updateProfile({
                institute: instituteData,
            });

            await refetch();

            toast.success('প্রতিষ্ঠানের তথ্য সফলভাবে সংরক্ষণ হয়েছে');

            onCompleted();
        } catch (error) {
            console.error('Failed to save institute details:', error);
            toast.error('প্রতিষ্ঠানের তথ্য সংরক্ষণ করা যায়নি');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/50
                p-4
            "
        >
            <div
                className="
                    relative
                    w-full
                    max-w-md
                    max-h-[85vh] sm:max-h-[90vh]
                    flex flex-col
                    rounded-lg
                    bg-white
                    shadow-xl
                    p-2 sm:p-3
                "
            >
                {/* Scrollable Container inside padding */}
                <div className="overflow-y-auto">
                    {/* Header */}
                    <div className="mb-6">
                        {/* Close / Cross Button */}

                        <div className='flex items-center justify-between'>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                প্রতিষ্ঠানের তথ্য দিন
                            </h2>
                            <button
                                type="button"
                                onClick={onSkip}
                                disabled={isSubmitting}
                                aria-label="Close"
                                className="flex h-6 w-6 items-center justify-center
                                rounded-full text-gray-400
                                hover:bg-gray-100 hover:text-gray-600
                                transition-colors focus:outline-none
                                disabled:pointer-events-none
                            "
                            >
                                <svg
                                    className="h-8 w-8"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>


                        <p className="mt-1.5 text-[13px] sm:text-sm leading-5 text-gray-500">
                            প্রশ্নপত্রে আপনার প্রতিষ্ঠানের তথ্য দেখানোর জন্য
                            নিচের তথ্যগুলো পূরণ করুন।
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Institute Name */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
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
                                className="
                                    w-full rounded-lg
                                    border border-gray-300
                                    px-3 py-2.5
                                    text-sm
                                    outline-none
                                    focus:border-indigo-500
                                    focus:ring-2 focus:ring-indigo-500/20
                                "
                            />
                        </div>

                        {/* Institute Type */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                প্রতিষ্ঠানের ধরন{' '}
                                <span className="text-red-500">*</span>
                            </label>

                            <select
                                name="type"
                                required
                                value={instituteData.type}
                                onChange={handleChange}
                                className="
                                    w-full rounded-lg
                                    border border-gray-300
                                    bg-white
                                    px-3 py-2.5
                                    text-sm
                                    outline-none
                                    focus:border-indigo-500
                                    focus:ring-2 focus:ring-indigo-500/20
                                "
                            >
                                <option value="">
                                    প্রতিষ্ঠানের ধরন নির্বাচন করুন
                                </option>
                                <option value="coaching">
                                    কোচিং সেন্টার
                                </option>
                                <option value="school">স্কুল</option>
                                <option value="college">কলেজ</option>
                                <option value="others">অন্যান্য</option>
                            </select>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                ফোন নম্বর
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                inputMode="numeric"
                                placeholder="013xxxxxxxx"
                                value={instituteData.phone}
                                minLength={11}
                                maxLength={11}
                                onChange={handleChange}
                                className="
                                    w-full rounded-lg
                                    border border-gray-300
                                    px-3 py-2.5
                                    text-sm
                                    outline-none
                                    focus:border-indigo-500
                                    focus:ring-2 focus:ring-indigo-500/20
                                "
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                প্রতিষ্ঠানের ঠিকানা
                            </label>

                            <input
                                type="text"
                                name="address"
                                value={instituteData.address}
                                onChange={handleChange}
                                placeholder="ঠিকানা"
                                className="
                                    w-full rounded-lg
                                    border border-gray-300
                                    px-3 py-2.5
                                    text-sm
                                    outline-none
                                    focus:border-indigo-500
                                    focus:ring-2 focus:ring-indigo-500/20
                                "
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-3">
                            <PressableButton
                                type="button"
                                onClick={onSkip}
                                disabled={isSubmitting}
                                variant={'outline'}
                                className="
                                    w-full sm:w-auto
                                    rounded-lg
                                    px-4 py-2.5
                                    text-sm font-medium
                                    text-gray-500
                                    hover:bg-gray-100
                                    hover:text-gray-700
                                    transition-colors
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                এখন নয়
                            </PressableButton>

                            <PressableButton
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:flex-1"
                            >
                                {isSubmitting
                                    ? 'সেভ হচ্ছে...'
                                    : 'তথ্য সংরক্ষণ করুন'}
                            </PressableButton>
                        </div>

                        <p className="text-center text-[11px] leading-4 text-gray-700">
                            আপনি চাইলে পরে <strong>প্রতিষ্ঠানের তথ্য</strong> সেকশন থেকে এই তথ্য যোগ করতে পারবেন।
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InstituteInfoModal;