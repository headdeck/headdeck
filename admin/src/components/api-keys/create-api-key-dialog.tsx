"use client";

import {useState, useTransition} from "react";
import {CalendarClock, Plus} from "lucide-react";
import {createApiKeyAction} from "@/app/(dashboard)/api-keys/actions";
import {formatDate} from "./api-key-utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (secret: string) => void;
};

export default function CreateApiKeyDialog({
                                               open,
                                               onOpenChange,
                                               onCreated,
                                           }: Props) {
    const [hours, setHours] = useState("720");
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const [neverExpires, setNeverExpires] = useState(false);

    const duration = Number(hours);
    const valid = Number.isSafeInteger(duration)
        && duration >= 1
        && duration <= 87600;

    function handleCreate() {
        if (pending || (!neverExpires && !valid)) return;

        setError(null);

        const input = neverExpires
            ? {}
            : {
                expiration: new Date(
                    Date.now() + duration * 3600000,
                ).toISOString(),
            };

        startTransition(async () => {
            const result = await createApiKeyAction(input);

            if (!result.success) {
                setError(result.error);
                return;
            }

            onOpenChange(false);
            setHours("720");
            setNeverExpires(false);
            onCreated(result.apiKey);
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (pending) return;
                setError(null);
                onOpenChange(value);
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                    <DialogDescription>
                        Generate a new Headscale API key with a
                        specified expiration duration.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="never-expires"
                        checked={neverExpires}
                        onCheckedChange={(checked) =>
                            setNeverExpires(checked === true)
                        }
                    />
                    <Label htmlFor="never-expires">
                        Never expires
                    </Label>
                </div>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <label
                            htmlFor="api-key-expiration"
                            className="text-sm font-medium"
                        >
                            Expiration (hours)
                        </label>
                        <Input
                            id="api-key-expiration"
                            type="number"
                            min={1}
                            max={87600}
                            value={hours}
                            disabled={pending || neverExpires}
                            onChange={(event) => setHours(event.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            How long the API key remains valid.
                        </p>
                    </div>

                    <div className="rounded-md border p-3">
                        <div className="flex items-start gap-3">
                            <CalendarClock className="mt-0.5 size-4 text-muted-foreground"/>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">
                                    Expiration Preview
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {neverExpires
                                        ? "Never expires"
                                        : valid
                                            ? formatDate(
                                                new Date(Date.now() + duration * 3600000).toISOString(),
                                            )
                                            : "Enter 1 to 87600 hours."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="rounded-md border p-3 text-xs text-muted-foreground">
                        The complete API key is displayed only
                        after successful creation. Store it
                        securely; it cannot be retrieved later.
                    </p>

                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={pending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={pending || (!neverExpires && !valid)}
                        onClick={handleCreate}
                    >
                        <Plus className="size-4"/>
                        {pending ? "Generating..." : "Generate API Key"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}