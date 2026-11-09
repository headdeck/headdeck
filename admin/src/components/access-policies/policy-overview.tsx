import {Code2, FileJson, ShieldCheck,} from "lucide-react";

import {Card, CardContent,} from "@/components/ui/card";

type Props = {
    valid: boolean;
    changed: boolean;
    updatedAt: string | null;
};

export default function PolicyOverview({
                                           valid,
                                           changed,
                                           updatedAt,
                                       }: Props) {
    return (
        <div className="grid gap-3 md:grid-cols-3">
            <Card>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Policy Format
                        </p>
                        <p className="mt-1 text-xl font-semibold">
                            HuJSON
                        </p>
                    </div>
                    <FileJson className="size-5 text-muted-foreground"/>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Draft Status
                        </p>
                        <p className="mt-1 text-xl font-semibold">
                            {changed ? "Modified" : "Unchanged"}
                        </p>
                    </div>
                    <Code2 className="size-5 text-muted-foreground"/>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Document Validation
                        </p>
                        <p className="mt-1 text-xl font-semibold">
                            {valid ? "Valid" : "Invalid"}
                        </p>
                    </div>
                    <ShieldCheck className="size-5 text-muted-foreground"/>
                </CardContent>
            </Card>
        </div>
    );
}