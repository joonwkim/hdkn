import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
import { GoogleUser } from "@/app/auth/types";
// import { loginAction } from "@/app/actions/userAction";
import { findUpdateGoogleUser, getUserByEmail } from "@/app/services/userService";
import { User } from "@prisma/client";

export const authOptions: NextAuthOptions = {
    providers: [
        // CredentialsProvider({
        //     name: 'Credentials',
        //     credentials: {
        //         email: { label: "Email", type: "text", placeholder: "Your email" },
        //         password: { label: "Password", type: "password" },
        //     },
        //     async authorize(credentials) {
        //         if (!credentials?.email || !credentials.password) {
        //             return null;
        //         }
        //         try {
        //             const input = {
        //                 email: credentials?.email,
        //                 password: credentials?.password
        //             };
        //             const user = await loginAction(input);
        //             if (user === 'password do not match' || user === 'user not registered') {
        //                 throw 'password do not match or user not registered';
        //             }
        //             return user;
        //         } catch (error) {
        //             console.error("Error in authorize:", error);
        //             return null;
        //         }              
        //     },

        // }),
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
            console.log('profile: ', profile)
            console.log('email: ', email)
            console.log('credentials: ', credentials)
            if (account?.provider === 'google' && user.email) {
                const googleUser: GoogleUser = {
                    name: user.name || " ",
                    email: user.email || " ",
                    image: user.image || " ",
                    // roles: ["USER"],
                    provider: 'google',
                    googleLogin: true
                };

                const result = await findUpdateGoogleUser(user.email, googleUser);
                console.log('update result: ', result)
            }
            else if (account?.provider === 'credentials') {
            }
            return true;
        },

        async session({ session, token }) {
            // console.log("Session Callback - Token:", token);
            // console.log("Session Callback - Current Session:", session);

            if (token) {
                session.user = {
                    id: token.id,
                    name: token.name,
                    email: token.email,
                    image: token.picture,
                    roles: token.roles || [],
                    notificationCount: token.notificationCount || 0,
                    membershipProcessedBys: token.membershipProcessedBys || [],
                    membershipRequestedBys: token.membershipRequestedBys || [],
                };
            }
            // console.log("Final Session:", session);
            return session;
        },

        async jwt({ token, user }) {
            // console.log("Initial JWT Token:", token);
            // console.log("User from JWT Callback:", user);

            if (user) {
                console.log("Adding user data to token");
                token.id = user.id;
            }

            const dbUser: User | null = await getUserByEmail(token.email || " ");
            // console.log("Database User:", dbUser);

            if (dbUser) {
                return {
                    ...token,
                    id: dbUser.id,
                    // roles: dbUser.userRoles || [],
                    notificationCount: dbUser.notificationCount || 0,
                    // membershipProcessedBys: dbUser.membershipProcessedBys || [],
                    // membershipRequestedBys: dbUser.membershipRequestedBys || [],
                };
            }
            return token;
        },
    },
    pages: {
        signIn: '/auth/login'
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

