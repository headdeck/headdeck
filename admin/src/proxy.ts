import {NextResponse} from "next/server";
import {auth} from "@/auth";

export const proxy = auth((request) => {
    const {pathname} = request.nextUrl;
    const authenticated = Boolean(request.auth);

    if (pathname === "/login") {
        if (authenticated) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        return NextResponse.next();
    }

    if (!authenticated) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/",
        "/nodes/:path*",
        "/users/:path*",
        "/pre-auth-keys/:path*",
        "/access-policies/:path*",
        "/api-keys/:path*",
        "/settings/:path*",
        "/login",
    ],
};