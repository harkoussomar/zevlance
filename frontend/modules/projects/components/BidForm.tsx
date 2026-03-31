"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button, Input, Textarea, FormField, Alert } from "@/components/ui";

interface BidFormProps {
    projectId: string;
    onSubmit: () => void;
}

export function BidForm({ projectId: _projectId, onSubmit }: BidFormProps) {
    const [price, setPrice] = useState("");
    const [days, setDays] = useState("");
    const [letter, setLetter] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!price || Number(price) <= 0) e.price = "Enter a valid proposed price";
        if (!days || Number(days) <= 0 || Number(days) > 365)
            e.days = "Enter estimated days (1–365)";
        if (!letter || letter.length < 50)
            e.letter = "Cover letter must be at least 50 characters";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 800));
        setLoading(false);
        setSubmitted(true);
        onSubmit();
    };

    if (submitted) {
        return (
            <Alert variant="success" title="Bid Submitted!">
                Your proposal has been sent. The client will review it and get back to you.
            </Alert>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField label="Your Price (USD)" required error={errors.price}>
                    <Input
                        type="number"
                        placeholder="1200"
                        value={price}
                        onChange={(e) => {
                            setPrice(e.target.value);
                            setErrors((er) => ({ ...er, price: "" }));
                        }}
                        error={errors.price}
                        startIcon={<span className="text-xs font-bold">$</span>}
                    />
                </FormField>
                <FormField label="Estimated Days" required error={errors.days}>
                    <Input
                        type="number"
                        placeholder="14"
                        value={days}
                        onChange={(e) => {
                            setDays(e.target.value);
                            setErrors((er) => ({ ...er, days: "" }));
                        }}
                        error={errors.days}
                    />
                </FormField>
            </div>

            <FormField
                label="Cover Letter"
                required
                error={errors.letter}
                hint={`${letter.length}/50 min · Tell the client why you're the best fit`}
            >
                <Textarea
                    placeholder="I have 5+ years of experience building Spring Boot APIs in production…"
                    rows={5}
                    value={letter}
                    onChange={(e) => {
                        setLetter(e.target.value);
                        setErrors((er) => ({ ...er, letter: "" }));
                    }}
                    error={errors.letter}
                />
            </FormField>

            <Button type="submit" size="lg" loading={loading} className="w-full">
                <Send className="w-4 h-4" />
                Submit Proposal
            </Button>
        </form>
    );
}