import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const {handlers, auth, signIn, signOut} = NextAuth({
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 8,
    },

    pages: {
        signIn: "/login",
    },

    providers: [
        Credentials({
            credentials: {
                apiKey: {
                    label: "API Key",
                    type: "password",
                },
            },

            async authorize() {
                return null;
            },
        }),
    ],
});