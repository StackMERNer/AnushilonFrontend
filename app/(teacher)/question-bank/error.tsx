"use client";
import { useRouter } from 'next/navigation';
import React from 'react'

const ErroPage = () => {
    const router = useRouter();
    return (
        <div>
            something went wrong
            <button onClick={() => router.refresh()}>try again</button>
        </div>
    )
}

export default ErroPage