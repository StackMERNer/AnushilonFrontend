
import { MessageCircle } from "lucide-react";

const HelpPage = () => {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        আমাদের সাথে যোগাযোগ করুন
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        প্রশ্নকোষ ব্যবহার করতে কোনো সমস্যা হলে বা কোনো প্রশ্ন
                        থাকলে আমাদের সাথে যোগাযোগ করুন। আমরা আপনাকে সাহায্য
                        করতে সর্বোচ্চ চেষ্টা করব।
                    </p>
                </div>

                <div className="flex justify-center">
                    <a
                        href="https://www.facebook.com/proshnokosh/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group w-full rounded-xl border p-5 transition-colors hover:bg-muted/50 sm:max-w-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                                <MessageCircle className="size-5" />
                            </div>

                            <div>
                                <h2 className="font-medium">
                                    Facebook-এ যোগাযোগ করুন
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    আমাদের Facebook পেজে মেসেজ পাঠিয়ে আপনার
                                    প্রশ্ন বা সমস্যার কথা জানান।
                                </p>
                            </div>
                        </div>
                    </a>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    প্রশ্নকোষ সম্পর্কিত যেকোনো সমস্যা, প্রশ্ন বা পরামর্শের জন্য
                    নির্দ্বিধায় আমাদের সাথে যোগাযোগ করুন।
                </p>
            </div>
        </div>
    );
};

export default HelpPage;

