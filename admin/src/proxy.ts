import {NextResponse} from "next/server";
import {auth} from "@/auth";

export const proxy = auth((request) => {
    const {pathname} = request.nextUrl;
    const authenticated = Boolean(request.auth);

    const path = (process.env.BASE_PATH ?? "")
        .trim()
        .replace(/^\/+|\/+$/g, "");

    const basePath = path ? `/${path}` : "";

    if (pathname === "/login") {
        if (authenticated) {
            return NextResponse.redirect(
                new URL(`${basePath}/`, request.url),
            );
        }

        return NextResponse.next();
    }

    if (!authenticated) {
        return NextResponse.redirect(
            new URL(`${basePath}/login`, request.url),
        );
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/",
        "/nodes/:path*",
        "/users/:path*",
        "/pre-auth-keys/:path*",
        "/preauth-keys/:path*",
        "/access-policies/:path*",
        "/api-keys/:path*",
        "/settings/:path*",
        "/login",
    ],
};