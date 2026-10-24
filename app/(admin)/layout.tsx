import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

export const metadata: Metadata = {
    title: 'অ্যাডমিন ড্যাশবোর্ড',
    robots: { index: false }
};

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <AdminRoute>
                <AppShell layout='admin'>
                    {children}</AppShell>
            </AdminRoute>
        </ProtectedRoute>
    );
}