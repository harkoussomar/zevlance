"use client";

import { useState, forwardRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";

import { cn } from "@/modules/shared";
import { Button } from "@/modules/shared/components/button";
import { Calendar } from "@/modules/shared/components/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/modules/shared/components/popover";

export const DatePicker = forwardRef<HTMLButtonElement, {
    value?: string;
    onChange?: (date: string) => void;
    min?: string;
    max?: string;
    placeholder?: string;
    disabled?: boolean;
    hasError?: boolean;
    name?: string;
    onBlur?: () => void;
}>(({
    value,
    onChange,
    min,
    max,
    placeholder = "Pick a date",
    disabled,
    hasError,
    name,
    onBlur,
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedDate = value && isValid(parseISO(value)) ? parseISO(value) : undefined;
    const minDate = min && isValid(parseISO(min)) ? parseISO(min) : undefined;
    const maxDate = max && isValid(parseISO(max)) ? parseISO(max) : undefined;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    type="button"
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal px-3 py-2",
                        !value && "text-muted-foreground",
                        hasError && "border-destructive text-destructive focus:ring-destructive",
                    )}
                    disabled={disabled}
                    onBlur={onBlur}
                    name={name}
                >
                    <CalendarIcon className="w-4 h-4 mr-2 opacity-50 shrink-0" />
                    <span className="truncate">
                        {selectedDate ? format(selectedDate, "PPP") : placeholder}
                    </span>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                        if (date) {
                            const y = date.getFullYear();
                            const m = String(date.getMonth() + 1).padStart(2, '0');
                            const d = String(date.getDate()).padStart(2, '0');
                            onChange?.(`${y}-${m}-${d}`);
                        } else {
                            onChange?.("");
                        }
                        setIsOpen(false);
                    }}
                    disabled={[
                        ...(minDate ? [{ before: minDate }] : []),
                        ...(maxDate ? [{ after: maxDate }] : []),
                    ]}
                    
                />
            </PopoverContent>
        </Popover>
    );
});
DatePicker.displayName = "DatePicker";
