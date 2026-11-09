import LoginForm from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
    const path = (process.env.BASE_PATH ?? "")
        .trim()
        .replace(/^\/+|\/+$/g, "");

    const basePath = path ? `/${path}` : "";

    return <LoginForm basePath={basePath}/>;
}