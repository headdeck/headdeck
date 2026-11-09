"use client";

import {useState} from "react";
import {WandSparkles} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {formatPolicyDocument} from "@headdeck/shared";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function PolicyHujsonEditor({
                                               value,
                                               onChange,
                                           }: Props) {
    const [formatError, setFormatError] = useState<string | null>(null);

    function handleFormat() {
        try {
            const formatted = formatPolicyDocument(value);

            onChange(formatted);
            setFormatError(null);
        } catch (error) {
            setFormatError(
                error instanceof Error
                    ? error.message
                    : "Unable to format document.",
            );
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFormat}
                >
                    <WandSparkles className="size-4"/>
                    Format Document
                </Button>
            </div>
            <Textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                spellCheck={false}
                aria-label="Headscale policy HuJSON editor"
                className="min-h-120 resize-y font-mono text-sm leading-6"
            />
            {formatError && (
                <p
                    role="alert"
                    className="text-sm text-destructive"
                >
                    {formatError}
                </p>
            )}
        </div>
    );
}