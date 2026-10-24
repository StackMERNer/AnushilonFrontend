import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';
import './../globals.css';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata: Metadata = {
    title: 'প্রশ্নকোষ - শিক্ষক ড্যাশবোর্ড',
    description: 'মিনিটেই নিখুঁত প্রশ্নপত্র তৈরি করুন',
    robots: { index: false }
};

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute><AppShell layout='teacher'>{children}</AppShell></ProtectedRoute>
    );
}