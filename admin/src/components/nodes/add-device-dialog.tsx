"use client";

import {type SubmitEvent, useState} from "react";
import {AlertTriangle, Check, Copy, Loader2, Plus} from "lucide-react";
import {useRouter} from "next/navigation";

import {UserSchema} from "@headdeck/shared";

import {registerNodeAction} from "@/app/(dashboard)/nodes/actions";
import {createPreAuthKeyAction} from "@/app/(dashboard)/preauth-keys/actions";

import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

type RegistrationMethod = "interactive" | "preauth";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    users: UserSchema.User[];
    externalUrl: string;
    usingFallback: boolean;
};

const installCommand = "curl -fsSL https://tailscale.com/install.sh | sh";

export default function AddDeviceDialog({
                                            open,
                                            onOpenChange,
                                            users,
                                            externalUrl,
                                            usingFallback,
                                        }: Props) {
    const router = useRouter();

    const [user, setUser] = useState("");
    const [method, setMethod] = useState<RegistrationMethod>("interactive");
    const [authId, setAuthId] = useState("");
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const loginCommand = [
        "sudo tailscale up",
        `--login-server ${externalUrl}`,
        ...(method === "preauth" && generatedKey
            ? [`--authkey ${generatedKey}`]
            : []),
    ].join(" ");

    function reset() {
        setUser("");
        setMethod("interactive");
        setAuthId("");
        setGeneratedKey(null);
        setError(null);
        setSuccess(false);
        setCopied(null);
    }

    function handleOpenChange(nextOpen: boolean) {
        if (loading) return;

        if (!nextOpen) {
            reset();
        }

        onOpenChange(nextOpen);
    }

    function changeMethod(nextMethod: RegistrationMethod) {
        if (loading || generatedKey) return;

        setMethod(nextMethod);
        setError(null);
        setSuccess(false);
        setCopied(null);
    }

    async function copyCommand(value: string, name: string) {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(name);
            setError(null);
        } catch {
            setError("Unable to copy. Please copy the command manually.");
        }
    }

    async function handleRegister(event: SubmitEvent) {
        event.preventDefault();

        if (loading || success) return;

        if (!user || !authId.trim()) {
            setError("Select a user and enter the authentication ID.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const selectedUser = users.find((item) => item.id === user);

            if (!selectedUser) {
                setError("Select a valid Headscale user.");
                return;
            }

            const result = await registerNodeAction({
                user: selectedUser.name,
                authId: authId.trim(),
            });

            if (!result.success) {
                setError(result.error);
                return;
            }

            setSuccess(true);
            router.refresh();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to register device.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerateKey() {
        if (loading || generatedKey) return;

        if (!users.some((item) => item.id === user)) {
            setError("Select a valid Headscale user.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const expiration = new Date(
                Date.now() + 60 * 60 * 1000,
            ).toISOString();

            const result = await createPreAuthKeyAction({
                user,
                reusable: false,
                ephemeral: false,
                expiration,
                aclTags: [],
            });

            if (!result.success) {
                setError(result.error);
                return;
            }

            setGeneratedKey(result.key);
            router.refresh();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to generate pre-authentication key.",
            );
        } finally {
            setLoading(false);
        }
    }

    function Command({
                         value,
                         name,
                     }: {
        value: string;
        name: string;
    }) {
        return (
            <div className="flex items-start gap-2 rounded-md border bg-muted/40 p-3">
                <code className="min-w-0 flex-1 break-all font-mono text-xs select-all">
                    {value}
                </code>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Copy ${name}`}
                    onClick={() => copyCommand(value, name)}
                >
                    {copied === name ? (
                        <Check className="size-4"/>
                    ) : (
                        <Copy className="size-4"/>
                    )}
                </Button>
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="size-5"/>
                        Add Device
                    </DialogTitle>

                    <DialogDescription>
                        Install Tailscale and connect a device to your Headscale network.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-3">
                    {usingFallback && (
                        <div
                            role="status"
                            className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm"
                        >
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500"/>

                            <p className="text-muted-foreground">
                                HEADSCALE_EXTERNAL_URL is not configured.
                                Using HEADSCALE_URL as a fallback.
                                Make sure this address is reachable from the device
                                you're registering.
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="device-user">User</Label>

                        <select
                            id="device-user"
                            value={user}
                            onChange={(event) => setUser(event.target.value)}
                            disabled={loading || !!generatedKey || success}
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        >
                            <option value="">Select a user</option>

                            {users.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <Label>Registration Method</Label>

                        <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
                            <input
                                type="radio"
                                name="device-registration-method"
                                checked={method === "interactive"}
                                disabled={loading || !!generatedKey || success}
                                onChange={() => changeMethod("interactive")}
                                className="mt-1 size-4 accent-primary"
                            />

                            <span>
                                <span className="block text-sm font-medium">
                                    Interactive Registration
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Register using the authentication ID from Tailscale.
                                </span>
                            </span>
                        </label>

                        <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
                            <input
                                type="radio"
                                name="device-registration-method"
                                checked={method === "preauth"}
                                disabled={loading || !!generatedKey || success}
                                onChange={() => changeMethod("preauth")}
                                className="mt-1 size-4 accent-primary"
                            />

                            <span>
                                <span className="block text-sm font-medium">
                                    Pre-authentication Key
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Generate a key to register the device automatically.
                                </span>
                            </span>
                        </label>
                    </div>

                    {method === "preauth" && !generatedKey && (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Generate a single-use key valid for one hour.
                            </p>

                            <Button
                                type="button"
                                disabled={loading || !user}
                                onClick={handleGenerateKey}
                            >
                                {loading && <Loader2 className="size-4 animate-spin"/>}
                                {loading ? "Generating..." : "Generate Key"}
                            </Button>
                        </div>
                    )}

                    {(method === "interactive" || generatedKey) && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>1. Install Tailscale</Label>
                                <Command value={installCommand} name="install"/>
                            </div>

                            <div className="space-y-2">
                                <Label>2. Connect to Headscale</Label>
                                <Command value={loginCommand} name="login"/>
                            </div>
                        </div>
                    )}

                    {method === "interactive" && (
                        <form
                            id="register-device-form"
                            onSubmit={handleRegister}
                            className="space-y-3"
                        >
                            <Label htmlFor="device-auth-id">
                                3. Register Device
                            </Label>

                            <p className="text-xs text-muted-foreground">
                                Run the connection command on your device.
                                Copy the authentication ID shown by Tailscale
                                and enter it below.
                            </p>

                            <Input
                                id="device-auth-id"
                                value={authId}
                                onChange={(event) => setAuthId(event.target.value)}
                                placeholder="Authentication ID"
                                disabled={loading || success}
                                required
                            />
                        </form>
                    )}

                    {method === "preauth" && generatedKey && (
                        <div className="space-y-2">
                            <Label>Generated Key</Label>

                            <Command value={generatedKey} name="key"/>

                            <p className="text-xs text-muted-foreground">
                                This key expires one hour after generation.
                                Copy it now. The full key may not be available again.
                            </p>

                            <p className="text-xs text-muted-foreground">
                                The device registers automatically when you run
                                the connection command.
                            </p>
                        </div>
                    )}

                    {success && (
                        <p role="status" className="text-sm text-emerald-600">
                            Device registered successfully.
                        </p>
                    )}

                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => {
                            handleOpenChange(false);

                            if (generatedKey) {
                                router.refresh();
                            }
                        }}
                    >
                        {success || generatedKey ? "Done" : "Close"}
                    </Button>

                    {method === "interactive" && !success && (
                        <Button
                            type="submit"
                            form="register-device-form"
                            disabled={loading || !user || !authId.trim()}
                        >
                            {loading && <Loader2 className="size-4 animate-spin"/>}
                            {loading ? "Registering..." : "Register Device"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}