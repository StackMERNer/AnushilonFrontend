"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";


import { PlanType } from "@/lib/constants";
import { IPaymentRecord, IPopulatedPaymentRecord, MobileBankingType, PaymentStatusType } from "@/services/payment.service";
import { createUserService } from "@/services/user.service";
import { apiClient } from "@/lib/api/api-client";
import { toast } from "sonner";

interface EditPaymentModalProps {
    payment: IPopulatedPaymentRecord;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (data: EditPaymentData) => void | Promise<void>;
}

export interface EditPaymentData extends Partial<IPaymentRecord> {
    plan: PlanType;
    amount: number;
    paymentMethod: MobileBankingType;
    transactionId?: string;
    phoneNumber?: string;
    paymentStatus: PaymentStatusType;
    statusMessage?: string;
}

const EditPaymentModal = ({
    payment,
    open,
    onOpenChange,
    onSave,
}: EditPaymentModalProps) => {
    const [plan, setPlan] = useState<PlanType>(payment.plan);
    const [amount, setAmount] = useState(String(payment.amount));
    const [duration, setDuration] = useState(payment.durationDays);
    const [paymentMethod, setPaymentMethod] =
        useState<MobileBankingType>(payment.paymentMethod);
    const [transactionId, setTransactionId] = useState(
        payment.transactionId ?? ""
    );
    const [searchEmail, setSearchEmail] = useState(payment.userId.email);

    const handleSearchWithEmail = () => {
        const userService = createUserService(apiClient);

        userService.getUserByEmailOrId(searchEmail).then((user) => {
            if (user) {
                setSelectedUser({
                    _id: user._id,
                    name: user.name!,
                    email: user.email
                });
            } else {
                toast.error("ইউজার পাওয়া যায় নি।");
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    const [selectedUser, setSelectedUser] = useState({
        _id: payment.userId._id,
        name: payment.userId.name!,
        email: payment.userId.email
    });

    const [phoneNumber, setPhoneNumber] = useState(payment.phoneNumber ?? "");
    const [paymentStatus, setPaymentStatus] =
        useState<PaymentStatusType>(payment.paymentStatus);
    const [statusMessage, setStatusMessage] = useState(
        payment.statusMessage ?? ""
    );
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!amount || Number(amount) < 0) {
            alert("invalid amount");
            return;
        }

        if (!duration || Number(duration) < 0) {
            alert("invalid duration");
            return;
        }

        const data: EditPaymentData = {
            userId: selectedUser._id,
            name: selectedUser.name,
            email: selectedUser.email,
            plan,
            amount: Number(amount),
            durationDays: duration,
            paymentMethod,
            transactionId: transactionId.trim() || undefined,
            phoneNumber: phoneNumber.trim() || undefined,
            paymentStatus,
            statusMessage: statusMessage.trim() || undefined,
        };

        try {
            setSaving(true);
            await onSave?.(data);
            onOpenChange(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} disablePointerDismissal onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-150">
                <DialogHeader>
                    <DialogTitle>Edit Payment</DialogTitle>
                    <DialogDescription>
                        Update the payment information for{" "}
                        <span className="font-medium text-foreground">
                            {payment.userId.name}
                        </span>
                        .
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
                    {/* User */}
                    <div className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-sm font-medium">{selectedUser.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {selectedUser.email}
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="searchEmail">Search User by Email or ID</Label>
                        <div className="flex gap-2 mt-3">
                            <Input
                                id="searchEmail"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                placeholder="Enter email or user ID"
                            />
                            <Button type="button" onClick={handleSearchWithEmail}>
                                Search
                            </Button>
                        </div>
                    </div>

                    {/* Plan + Amount */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Plan</Label>

                            <Select
                                value={plan}
                                onValueChange={(value) => setPlan(value as PlanType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select plan" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="six_month">6 Months</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                    <SelectItem value="subject_yearly">
                                        Subject Yearly
                                    </SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>

                            <Input
                                id="amount"
                                type="number"
                                min={0}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="durationDays">Duration Days</Label>

                            <Input
                                id="durationDays"
                                type="number"
                                min={0}
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Payment Method + Status */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Payment Method</Label>

                            <Select
                                value={paymentMethod}
                                onValueChange={(value) =>
                                    setPaymentMethod(value as MobileBankingType)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="bKash">bKash</SelectItem>
                                    <SelectItem value="nagad">Nagad</SelectItem>
                                    <SelectItem value="rocket">Rocket</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Status</Label>

                            <Select
                                value={paymentStatus}
                                onValueChange={(value) =>
                                    setPaymentStatus(value as PaymentStatusType)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="invalid">Invalid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Transaction ID */}
                    <div className="space-y-2">
                        <Label htmlFor="transactionId">Transaction ID</Label>

                        <Input
                            id="transactionId"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Enter transaction ID"
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>

                        <Input
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="01XXXXXXXXX"
                        />
                    </div>

                    {/* Selected Subjects */}
                    {payment.selectedSubjects?.length > 0 && (
                        <div className="space-y-2">
                            <Label>Selected Subjects</Label>

                            <div className="space-y-2 rounded-lg border p-3">
                                {payment.selectedSubjects.map((subject, index) => (
                                    <div
                                        key={`${subject.subjectId.class._id}-${index}`}
                                        className="flex items-center justify-between gap-3 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {subject.subjectId.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {subject.subjectId.class.name}
                                            </p>
                                        </div>

                                        <span className="font-medium">
                                            ৳{subject.price}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status Message */}
                    <div className="space-y-2">
                        <Label htmlFor="statusMessage">Status Message</Label>

                        <Textarea
                            id="statusMessage"
                            value={statusMessage}
                            onChange={(e) => setStatusMessage(e.target.value)}
                            placeholder="Optional message..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>

                    <Button type="button" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditPaymentModal;

