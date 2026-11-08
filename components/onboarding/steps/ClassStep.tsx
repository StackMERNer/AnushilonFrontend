import { useClasses } from '@/hooks/use-academic'; // Or your preferred toast library
import { apiClient } from '@/lib/api/api-client';
import { createUserService } from '@/services/user.service';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

// IDs of classes that require stream selection
const STREAM_REQUIRED_CLASS_IDS = [
    '6a6e31bcd2ea30ebd6a29b2e',
    '6a6e31bdd2ea30ebd6a29ded',
];

// Stream options
const STREAMS = [
    { id: 'science', label: 'সাইন্স (Science)', icon: '🧪' },
    { id: 'commerce', label: 'কমার্স (Commerce)', icon: '📊' },
    { id: 'humanities', label: 'মানবিক (Humanities)', icon: '🎨' },
];

interface ClassOnboardingStepProps {
    onCompleted?: () => void;
    refetchUser?: () => Promise<any>;
}

const ClassOnboardingStep: React.FC<ClassOnboardingStepProps> = ({
    onCompleted,
    refetchUser,
}) => {
    const { data: classes, isLoading, error } = useClasses();

    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [selectedStream, setSelectedStream] = useState<string | null>(null);
    const [step, setStep] = useState<'class' | 'stream'>('class');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    // Helper to handle updating the user profile
    const handleUpdateProfile = async (classId: string, stream?: string) => {
        setIsSubmitting(true);
        try {
            const userService = createUserService(apiClient);

            await userService.updateProfile({
                // Adjust these field names to match your IUser interface
                ...(classId && { class: classId }),
                ...(stream && { stream }),
            });

            if (refetchUser) {
                await refetchUser();
            }

            toast.success('তথ্য সফলভাবে সংরক্ষণ হয়েছে');
            if (onCompleted) {
                onCompleted();
            }
        } catch (err) {
            console.error('Failed to update user profile:', err);
            toast.error('তথ্য সংরক্ষণ করা যায়নি');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle class item click
    const handleSelectClass = async (classId: string) => {
        setSelectedClassId(classId);

        // Check if selected class requires stream selection
        if (STREAM_REQUIRED_CLASS_IDS.includes(classId)) {
            setStep('stream');
        } else {
            // If stream not required, complete the onboarding step immediately
            await handleUpdateProfile(classId);
        }
    };

    // Handle stream item click
    const handleSelectStream = async (streamId: string) => {
        setSelectedStream(streamId);
        if (selectedClassId) {
            await handleUpdateProfile(selectedClassId, streamId);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-neutral-400 animate-pulse text-lg">লোড হচ্ছে...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-red-500 text-lg">তথ্য লোড করতে সমস্যা হয়েছে</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative">
            {/* Back button (shown when on stream step) */}
            {step === 'stream' && (
                <button
                    onClick={() => setStep('class')}
                    disabled={isSubmitting}
                    className="absolute top-6 left-6 p-2 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer text-white disabled:opacity-50"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            )}

            <div className="w-full max-w-md flex flex-col items-center">
                {/* Mascot Header */}
                <div className="flex items-center gap-4 mb-8">

                    {/* Speech Bubble */}
                    <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl px-5 py-3 text-lg font-medium shadow-lg">
                        {/* Bubble arrow tip */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-neutral-900" />
                        <p>
                            {step === 'class'
                                ? 'তুমি কোন ক্লাসে পড়াশোনা করো ?'
                                : 'তুমি কোন বিভাগে পড়াশোনা করো ?'}
                        </p>
                    </div>
                </div>

                {/* Options Container */}
                <div className="w-full flex flex-col gap-3">
                    {step === 'class' ? (
                        /* Render Classes */
                        classes?.map((c) => (
                            <button
                                key={c._id}
                                onClick={() => handleSelectClass(c._id)}
                                disabled={isSubmitting}
                                className="w-full py-4 px-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-xl text-center cursor-pointer transition-all duration-200 hover:scale-[0.98] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                <span>{c.name}</span>
                            </button>
                        ))
                    ) : (
                        /* Render Streams */
                        STREAMS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => handleSelectStream(s.id)}
                                disabled={isSubmitting}
                                className="w-full py-4 px-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-xl cursor-pointer transition-all duration-200 hover:scale-[0.98] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                <span className="text-2xl">{s.icon}</span>
                                <span>{s.label}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassOnboardingStep;