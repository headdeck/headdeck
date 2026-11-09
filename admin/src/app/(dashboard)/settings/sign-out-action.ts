"use server";

import {signOut} from "@/auth";

export async function signOutAction() {
    const path = (process.env.BASE_PATH ?? "")
        .trim()
        .replace(/^\/+|\/+$/g, "");

    const basePath = path ? `/${path}` : "";

    await signOut({
        redirectTo: `${basePath}/login`,
    });
}