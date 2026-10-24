"use client";

import { useEffect, useState } from "react";

export default function TunnelTestPage() {
    const [count, setCount] = useState(0);
    const [message, setMessage] = useState("Nothing clicked yet.");

    useEffect(() => {
        console.log("TEST PAGE: React mounted");
    }, []);

    const handleClick = (name: string) => {
        console.log(`TEST PAGE: ${name} clicked`);
        setMessage(`${name} clicked successfully!`);
        alert(`${name} clicked successfully!`);
    };

    return (
        <main className="min-h-screen bg-gray-100 p-10">
            <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-lg">
                <h1 className="text-3xl font-bold">
                    Tunnel Test Page
                </h1>

                <p className="mt-2 text-gray-600">
                    Testing whether React events work through the tunnel.
                </p>

                <div className="mt-8 rounded-lg bg-gray-100 p-4">
                    <p className="font-mono text-sm">
                        Current count: {count}
                    </p>

                    <p className="mt-2 font-mono text-sm">
                        Message: {message}
                    </p>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                    <button
                        type="button"
                        onClick={() => handleClick("Button 1")}
                        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                        Button 1 — Alert
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            console.log("TEST PAGE: Counter clicked");
                            setCount((c) => c + 1);
                        }}
                        className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                    >
                        Button 2 — React State
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            console.log("TEST PAGE: Both clicked");
                            setCount((c) => c + 1);
                            setMessage("Both React state and event work!");
                            alert("React event + state both work!");
                        }}
                        className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
                    >
                        Button 3 — State + Alert
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            console.log("TEST PAGE: Native DOM test");
                            document.title = "BUTTON CLICKED";
                            alert("Native DOM interaction worked!");
                        }}
                        className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
                    >
                        Button 4 — DOM Test
                    </button>
                </div>

                <div className="mt-8 rounded-lg border p-4">
                    <p className="font-semibold">
                        Open Console
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                        You should see:
                    </p>

                    <pre className="mt-2 rounded bg-black p-4 text-sm text-white">
                        {`TEST PAGE: React mounted
TEST PAGE: Button 1 clicked
TEST PAGE: Counter clicked`}
                    </pre>
                </div>
            </div>
        </main>
    );
}