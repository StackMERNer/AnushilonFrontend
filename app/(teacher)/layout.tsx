import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';
import './../globals.css';
import ProtectedRoute from '@/components/ProtectedRoute';
import StudentOnboardingGate from '@/components/onboarding/StudentOnboardingGate';

export const metadata: Metadata = {
    title: 'অনুশীলন - ড্যাশবোর্ড',
    description: 'সফলতার নির্ভরযোগ্য সূত্র  তৈরি করুন',
    robots: { index: false }
};

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <StudentOnboardingGate>
                <AppShell layout='student'>{children}</AppShell>
            </StudentOnboardingGate>
        </ProtectedRoute>
    );
}