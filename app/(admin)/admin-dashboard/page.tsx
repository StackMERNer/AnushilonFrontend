"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    MoreHorizontal,
} from "lucide-react";

import { useUsers } from "@/hooks/use-users";
import Image from "next/image";

const AdminDashboardPage = () => {
    const [page, setPage] = useState(1);
    const limit = 20;

    const {
        data: paginatedUsers,
        isLoading,
        isFetching,
    } = useUsers(page, limit);

    const users = paginatedUsers?.items ?? [];

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Admin Dashboard
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage registered users
                    </p>
                </div>

                <Link
                    href="/dashboard"
                    className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                    Switch to user
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                        Total Users
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                        {paginatedUsers?.totalItems ?? "—"}
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                        Current Page
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                        {paginatedUsers?.currentPage ?? "—"}
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                        Total Pages
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                        {paginatedUsers?.totalPages ?? "—"}
                    </p>
                </div>
            </div>

            {/* Users table */}
            <div className="overflow-hidden rounded-xl border bg-card">
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <div>
                        <h2 className="font-semibold">Users</h2>

                        <p className="text-sm text-muted-foreground">
                            {paginatedUsers
                                ? `${paginatedUsers.totalItems} registered users`
                                : "Loading users..."}
                        </p>
                    </div>

                    {isFetching && !isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40 text-left">
                                <th className="px-5 py-3 font-medium">
                                    User
                                </th>

                                <th className="px-5 py-3 font-medium">
                                    Institute
                                </th>

                                <th className="px-5 py-3 font-medium">
                                    Role
                                </th>

                                <th className="px-5 py-3 font-medium">
                                    Joined
                                </th>

                                <th className="w-10 px-5 py-3" />
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={5} className="px-5 py-5">
                                            <div className="h-5 w-full animate-pulse rounded bg-muted" />
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-12 text-center text-muted-foreground"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.uid}
                                        className="transition-colors hover:bg-muted/30"
                                    >
                                        {/* User */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-medium text-primary">
                                                    {user.photoURL ? (
                                                        <Image
                                                            src={user.photoURL}
                                                            alt=""
                                                            className="object-cover"
                                                            width={36}
                                                            height={36}
                                                        />
                                                    ) : (
                                                        user.name
                                                            ?.charAt(0)
                                                            .toUpperCase() ||
                                                        "U"
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">
                                                        {user.name || "Unnamed user"}
                                                    </p>

                                                    <p className="max-w-[250px] truncate text-xs text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Institute */}
                                        <td className="px-5 py-4">
                                            {user.institute ? (
                                                <div>
                                                    <p className="font-medium">
                                                        {user.institute.name}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {user.institute.type}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        {/* Role */}
                                        <td className="px-5 py-4">
                                            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium capitalize text-primary">
                                                {user.role}
                                            </span>
                                        </td>

                                        {/* Joined */}
                                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                                            {new Date(
                                                user.createdAt
                                            ).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                className="rounded-lg p-2 transition-colors hover:bg-muted"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {paginatedUsers && paginatedUsers.totalPages > 0 && (
                    <div className="flex items-center justify-between border-t px-5 py-4">
                        <p className="text-sm text-muted-foreground">
                            Page {paginatedUsers.currentPage} of{" "}
                            {paginatedUsers.totalPages}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page === 1 || isFetching}
                                onClick={() =>
                                    setPage((current) =>
                                        Math.max(current - 1, 1)
                                    )
                                }
                                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={
                                    !paginatedUsers.nextPage || isFetching
                                }
                                onClick={() => {
                                    if (paginatedUsers.nextPage) {
                                        setPage(paginatedUsers.nextPage);
                                    }
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;