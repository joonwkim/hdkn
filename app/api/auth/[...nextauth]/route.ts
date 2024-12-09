import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { GoogleUser } from "@/app/auth/types";
import { loginAction } from "@/app/actions/userAction";
import { findUpdateGoogleUser, getUserByEmail } from "@/app/services/userService";

export const authOptions: NextAuthOptions = {

    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Your email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }
                try {
                    const input = {
                        email: credentials?.email,
                        password: credentials?.password
                    };
                    const user = await loginAction(input);
                    if (user === 'password do not match' || user === 'user not registered') {
                        throw 'password do not match or user not registered';
                    }
                    return user;
                } catch (error) {
                    // throw JSON.stringify(error);
                }
                return null;
            },

        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || "",
            clientSecret: process.env.GOOGLE_SECRET || "",
        }),
    ],
    theme: {
        colorScheme: "light",
    },

    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            if (account?.provider === 'google' && user.email) {
                const googleUser: GoogleUser = {
                    name: user.name || " ",
                    email: user.email || " ",
                    image: user.image || " ",
                    roles: ["USER"],
                    provider: 'google',
                    googleLogin: true
                };

                const result = await findUpdateGoogleUser(user.email, googleUser);
            }
            else if (account?.provider === 'credentials') {
            }
            return true;
        },
        async session({ session, user, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
                session.user.roles = token.roles ? token.roles : [];
                session.user.notificationCount = token.notificationCount;
                session.user.membershipProcessedBys = token.membershipProcessedBys;
                session.user.membershipRequestedBys = token.membershipRequestedBys;
            }
            return session;
        },

        async jwt({ token, user }) {
            const dbUser: any = await getUserByEmail(token.email || " ");
            if (!dbUser) {
                token.id = user!.id;
                token.roles = dbUser.roles;
                return token;
            }
            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
                roles: dbUser.roles,
                notificationCount: dbUser.notificationCount,
                membershipProcessedBys: dbUser.membershipProcessedBys,
                membershipRequestedBys: dbUser.membershipRequestedBys,
            };
        },
    },
    pages: {
        signIn: '/auth/login'
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

