import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { GoogleUser } from "@/app/auth/types";
import { findUpdateGoogleUser, getSessionUserByEmail, } from "@/app/services/userService";

export const authOptions: NextAuthOptions = {
    providers: [
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
                // console.log('token:', token)
                session.user = {
                    id: token.id,
                    name: token.name,
                    email: token.email,
                    image: token.picture,
                    roles: token.roles,
                    notificationCount: token.notificationCount || 0,
                    membershipProcessedBys: token.membershipProcessedBys || [],
                    membershipRequestedBys: token.membershipRequestedBys || [],
                    preference: token.preference || undefined,
                };
                // console.log('session: ', session)
                return session;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                // console.log("Adding user data to token!!!");
                token.id = user.id;
            }

            if (token.email) {
                const sessionUser = await getSessionUserByEmail(token.email);
                // console.log('session User: ', sessionUser)
                if (sessionUser) {
                    const nt = {
                        ...token,
                        id: sessionUser.id,
                        roles: sessionUser.roles || [],
                        preference: sessionUser.preference || undefined,
                        // notificationCount: sessionUser.notificationCount || 0,
                        // membershipProcessedBys: sessionUser.membershipProcessedBys || [],
                        // membershipRequestedBys: sessionUser.membershipRequestedBys || [],
                    };
                    // console.log('new token: ', nt)
                    // console.log('new token: ', Object.keys(nt));
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

