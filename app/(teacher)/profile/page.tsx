"use client";

import { Building2, Mail, Shield, User } from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const ProfilePage = () => {
    const { data: user, isLoading } = useUserProfile();
    const { logout } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const handleLogout = async () => {
        if (!window.confirm("আপনি কি লগআউট করতে চান?")) {
            return;
        }
        try {

            await logout();
            queryClient.clear();
            router.replace("/");
        } catch (error) {
            toast.error("লগআউট করতে ব্যর্থ। আবার চেষ্টা করুন।");
        }
    }
    if (isLoading) {
        return (<div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
            প্রোফাইল লোড হচ্ছে... </div>
        );
    }

    if (!user) {
        return (<div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
            প্রোফাইল পাওয়া যায়নি। </div>
        );
    }

    return (<div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6"> <Card> <CardHeader> <CardTitle>প্রোফাইল</CardTitle> </CardHeader>
        <CardContent className="space-y-6">
            {/* Profile header */}
            <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-muted">
                    {user.photoURL ? (
                        <Image
                            src={user.photoURL}
                            alt={user.name || "Profile"}
                            fill
                            sizes="80px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <User className="h-9 w-9 text-muted-foreground" />
                        </div>
                    )}
                </div>

                <div className="min-w-0">
                    <h2 className="text-xl font-semibold">
                        {user.name || "নাম দেওয়া হয়নি"}
                    </h2>

                    <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                    </p>
                </div>
            </div>

            {/* Information */}
            <div className="divide-y rounded-xl border">
                <div className="flex items-center gap-3 px-4 py-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />

                    <div>
                        <p className="text-xs text-muted-foreground">ইমেইল</p>
                        <p className="text-sm font-medium">{user.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />

                    <div>
                        <p className="text-xs text-muted-foreground">অ্যাকাউন্ট টাইপ</p>
                        <p className="text-sm font-medium">
                            {user.role === "admin" ? "অ্যাডমিন" : "শিক্ষক"}
                        </p>
                    </div>
                </div>

                {user.institute && (
                    <div className="flex items-center gap-3 px-4 py-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />

                        <div>
                            <p className="text-xs text-muted-foreground">
                                প্রতিষ্ঠান
                            </p>
                            <p className="text-sm font-medium">
                                {/* Change `name` if your IInstitute uses another field */}
                                {user.institute.name}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <button className='w-full bg-destructive py-3 rounded-lg text-white' onClick={handleLogout}>লগআউট করুন</button>
        </CardContent>
    </Card>

    </div>
    );
};

export default ProfilePage;
