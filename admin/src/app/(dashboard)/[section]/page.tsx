import {notFound} from "next/navigation";

const sections: Record<string, {
    title: string;
    description: string;
}> = {
    nodes: {
        title: "Nodes",
        description: "Manage registered devices and their routes.",
    },
    users: {
        title: "Users",
        description: "Manage Headscale users.",
    },
    "pre-auth-keys": {
        title: "Pre-auth Keys",
        description: "Manage device enrollment keys.",
    },
    policies: {
        title: "Access Policies",
        description: "View and manage network access policies.",
    },
    "api-keys": {
        title: "API Keys",
        description: "Manage Headscale API credentials.",
    },
    settings: {
        title: "Settings",
        description: "Configure HeadDeck preferences.",
    },
};

export function generateStaticParams() {
    return Object.keys(sections).map((section) => ({
        section,
    }));
}

export default async function SectionPage({
                                              params,
                                          }: PageProps<"/[section]">) {
    const {section} = await params;
    const page = sections[section];

    if (!page) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                    {page.title}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    {page.description}
                </p>
            </div>

            <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed">
                <p className="text-sm text-muted-foreground">
                    This section is under development.
                </p>
            </div>
        </div>
    );
}