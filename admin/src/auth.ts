import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import {AuthSchema} from "@headdeck/shared";

export const {handlers, auth, signIn, signOut} = NextAuth({
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 8,
    },

    pages: {
        signIn: `${process.env.BASE_PATH?.replace(/\/+$/, "") || ""}/login`,
    },

    providers: [
        Credentials({
            credentials: {
                apiKey: {
                    label: "API Key",
                    type: "password",
                },
            },

            async authorize(credentials) {
                const parsed = AuthSchema.LoginSchema.safeParse(credentials);

                if (!parsed.success) {
                    return null;
                }

                const response = await fetch(
                    `${process.env.HEADSCALE_URL}/api/v1/user`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${parsed.data.apiKey}`,
                        },
                        cache: "no-store",
                    },
                );

                if (!response.ok) {
                    return null;
                }

                return {
                    id: "headscale",
                    apiKey: parsed.data.apiKey,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({token, user}) {
            if (user && "apiKey" in user) {
                token.apiKey = user.apiKey;
            }

            return token;
        },

        async session({session}) {
            return session;
        },
    },
});