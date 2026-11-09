"use client";

import {useState} from "react";

import {Button} from "@/components/ui/button";

import PolicyHujsonEditor from "./policy-hujson-editor";
import PolicyVisualEditor from "./policy-visual-editor";
import {UserSchema} from "@headdeck/shared";

type Props = {
    value: string;
    onChange: (value: string) => void;
    users: UserSchema.User[];
};

export default function PolicyDocumentEditor({
                                                 value,
                                                 onChange,
                                                 users,
                                             }: Props) {
    const [mode, setMode] = useState<"visual" | "hujson">(
        "visual",
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={
                        mode === "visual"
                            ? "default"
                            : "outline"
                    }
                    onClick={() => setMode("visual")}
                >
                    Visual Editor
                </Button>

                <Button
                    variant={
                        mode === "hujson"
                            ? "default"
                            : "outline"
                    }
                    onClick={() => setMode("hujson")}
                >
                    HuJSON Editor
                </Button>
            </div>

            {mode === "visual" ? (
                <PolicyVisualEditor
                    value={value}
                    onChange={onChange}
                    users={users}
                />
            ) : (
                <PolicyHujsonEditor
                    value={value}
                    onChange={onChange}
                />
            )}
        </div>
    );
}