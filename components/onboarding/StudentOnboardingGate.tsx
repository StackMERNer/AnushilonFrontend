"use client";
import { useUserProfile } from '@/hooks/useUserProfile';
import React from 'react'
import ClassOnboardningStep from './steps/ClassStep';

const StudentOnboardingGate = ({ children }: { children: React.ReactNode }) => {
    const { data: user, isLoading, refetch: refetchUser } = useUserProfile();
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background text-foreground transition-colors duration-200">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm font-medium text-muted-foreground">
                        প্রোফাইল লোড হচ্ছে...
                    </p>
                </div>
            </div>
        )
    }
    if (user && (!user.class || !user.stream)) {
        return <ClassOnboardningStep refetchUser={refetchUser} />
    }
    return children
}

export default StudentOnboardingGate