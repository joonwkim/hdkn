import { Role } from "@prisma/client"
import "next-auth/jwt"

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth/jwt" {
    interface JWT {
        /** The user's role. */
        id: UserId
        roles: Role[]
    }
}

declare module "next-auth" {
    interface Session {
        user: User & {
            id: UserId;
            roles: Role[];
            preference?: {
                viewType: string;
                blogsPerPage: number;
                sortOrder: string;
                theme?: string;
                selectedBlogId: string;
            };
        }
    }
}
