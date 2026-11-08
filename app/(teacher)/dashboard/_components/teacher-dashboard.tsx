'use client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useState } from 'react';
import InstituteInfoModal from './InstituteInfoModal';
import ms from 'ms';
import DueBanner from '@/components/study/due-banner';

const INSTITUTE_SKIP_KEY = 'institute-info-modal-skipped';
const SKIP_DURATION = ms('3h');

const StudentDashboard = () => {
    const { data: user, isLoading: userLoading } = useUserProfile();

    const [isSkipped, setIsSkipped] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        const skippedAt = localStorage.getItem(INSTITUTE_SKIP_KEY);

        if (!skippedAt) {
            return false;
        }

        const timestamp = Number(skippedAt);

        if (!Number.isFinite(timestamp)) {
            localStorage.removeItem(INSTITUTE_SKIP_KEY);
            return false;
        }

        const isStillValid =
            Date.now() - timestamp < SKIP_DURATION;

        if (!isStillValid) {
            localStorage.removeItem(INSTITUTE_SKIP_KEY);
        }

        return isStillValid;
    });

    const handleSkip = () => {
        localStorage.setItem(
            INSTITUTE_SKIP_KEY,
            Date.now().toString()
        );

        setIsSkipped(true);
    };

    const handleCompleted = () => {
        localStorage.removeItem(INSTITUTE_SKIP_KEY);
        setIsSkipped(true);
    };

    const showInstituteModal =
        !userLoading &&
        !!user &&
        !user.institute?.name &&
        !isSkipped;

    return (
        <div className="p-4 sm:p-8 lg:p-[20px_40px_50px] flex-1">
            {/* <DueBanner /> */}
            <InstituteInfoModal
                open={showInstituteModal}
                onCompleted={handleCompleted}
                onSkip={handleSkip}
            />
        </div>
    );
};

export default StudentDashboard;