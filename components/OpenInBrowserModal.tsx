export default function OpenInBrowserModal({
    onClose,
}: {
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                <h2 className="text-xl font-bold text-gray-900">
                    Google Login
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                    You are currently using Facebook/Messenger&apos;s built-in
                    browser.
                </p>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                    For the easiest Google login:
                </p>

                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700">
                    <li>
                        Tap the <strong>⋯</strong> menu.
                    </li>
                    <li>
                        Select <strong>Open in browser</strong>.
                    </li>
                    <li>
                        Sign in with Google there.
                    </li>
                </ol>

                <div className="mt-6 space-y-3">
                    <button
                        onClick={() => {
                            navigator.clipboard
                                ?.writeText(window.location.href)
                                .catch(() => { });

                            onClose();
                        }}
                        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white"
                    >
                        Copy Link
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full rounded-lg border px-4 py-3 text-sm font-semibold text-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}