import {ExternalLink, Info} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";

export default function AboutCard() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Info className="size-4 text-muted-foreground"/>
                    <CardTitle>About HeadDeck</CardTitle>
                </div>
                <CardDescription>
                    Project information and community resources.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                        Application
                    </span>
                    <span className="text-sm font-medium">HeadDeck</span>
                </div>

                <Separator/>

                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                        Version
                    </span>
                    <Badge variant="outline">
                        v{process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown"}
                    </Badge>
                </div>

                <Separator/>

                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                        Project
                    </span>
                    <span className="text-sm">Open Source</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                        variant="outline"
                        nativeButton={false}
                        render={
                            <a
                                href="https://github.com/headdeck/headdeck"
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        }
                    >
                        <ExternalLink className="size-4"/>
                        GitHub
                    </Button>

                    <Button
                        variant="outline"
                        nativeButton={false}
                        render={
                            <a
                                href="https://headdeck.org"
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        }
                    >
                        Website
                        <ExternalLink className="size-3.5"/>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}