"use client";
import { useRouter } from 'next/navigation';

const ErrorPage = () => {
    const router = useRouter();
    return (
        <div className='flex flex-col items-center justify-center h-screen gap-4'>
            <h1 className='text-2xl font-bold'>Something went wrong!</h1>
            <button onClick={() => router.refresh()}>try again</button>
        </div>
    )
}

export default ErrorPage