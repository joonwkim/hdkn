import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { GoogleUser } from "@/app/auth/types";
import { findUpdateGoogleUser, getSessionUserByEmail, } from "@/app/services/userService";

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
        async signIn({ user, account, }) {
            if (account?.provider === 'google' && user.email) {
                const googleUser: GoogleUser = {
                    name: user.name || " ",
                    email: user.email || " ",
                    image: user.image || " ",
                    provider: 'google',
                    googleLogin: true
                };

                await findUpdateGoogleUser(user.email, googleUser);
            }
            else if (account?.provider === 'credentials') {
            }
            return true;
        },

        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id,
                    name: token.name,
                    email: token.email,
                    image: token.picture,
                    roles: token.roles,
                    notificationCount: token.notificationCount || 0,
                    membershipProcessedBys: token.membershipProcessedBys || [],
                    membershipRequestedBys: token.membershipRequestedBys || [],
                };
                return session;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                console.log("Adding user data to token!!!");
                token.id = user.id;
            }

            if (token.email) {
                const sessionUser = await getSessionUserByEmail(token.email);
                // console.log('session User: ', sessionUser)
                if (sessionUser) {
                    const nt = {
                        ...token,
                        id: sessionUser.id,
                        // notificationCount: sessionUser.notificationCount || 0,
                        // isUserAdmin: sessionUser.isUserAdmin,
                        // isAdmin: isAdmin,
                        // membershipProcessedBys: dbUser.membershipProcessedBys || [],
                        // membershipRequestedBys: dbUser.membershipRequestedBys || [],
                    };
                    // console.log('new token: ', nt)
                    return nt;
                }              
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

