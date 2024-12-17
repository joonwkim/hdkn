import prisma from '@/prisma/prisma';
import bcrypt from "bcrypt";
import { getHashedPassword } from '../lib/password';
import { Prisma, User } from '@prisma/client';
import { GoogleUser } from '../auth/types';

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            include: {
                knowHows: true,
                votes: true,
                membershipProcessedBys: true,
                membershipRequestedBys: true,
            }
        });
        return users;
    } catch (error) {
        return ({ error });
    }
}

export async function isUserRegistered(email: string): Promise<boolean> {
    return await getUserByEmail(email) != null;
}

export async function isPasswordValid(email: string, password: string): Promise<boolean | undefined> {
    try {
        if (!email || !password) return false;
        const user: User | null = await getUserByEmail(email);
        if (user?.password) {
            const result = await bcrypt.compare(password, user.password).catch(() => false);
            return result;
        }

    } catch (error) {
        console.log('isPasswordValid error:', error)
        return false;
    }
}

export async function createUser(input: Prisma.UserCreateInput): Promise<User | null> {
    try {
        const user = await prisma.user.create({ data: input });
        return user
    }
    catch (error) {
        console.log('error: ', error)
        return null
    }
}

export async function getUserByEmail(emailInput: string): Promise<User | null> {
    try {
        const user: User | null = await prisma.user.findFirst({
            where: {
                email: emailInput,
            },
            include: {
                // knowHows:true,
                userRoles: {
                    include: {
                        role: true,
                    }
                },
                votes: true,
                membershipProcessedBys: {
                    include: {
                        knowhow: true,
                        membershipRequestedBy: true,
                    }
                },
                membershipRequestedBys: {
                    include: {
                        knowhow: true,
                        membershipProcessedBy: true,
                    }
                },
            }
        });
        return user;
    } catch (error) {
        console.log('error: ', error)
        return null;
    }
}

export async function getUserById(id: string) {
    const user = await prisma.user.findFirst({
        where: {
            id: id,
        },
        include: {
            profile: true,
            messages: {
                include: {
                    messageRecipients: true,
                }
            }

        }
    })
    return user;
}

export async function updateUserNameAndPassword(user: User, password: string) {
    const hashedPassword = await getHashedPassword(password);
    const updateUser = await prisma.user.update({
        where: {
            email: user.email,
        },
        data: {
            name: user.name,
            password: hashedPassword,
        }
    });
    if (updateUser) {
        return true;
    }
    else {
        return false;
    }
}
export async function updateUserPassword(email: string, password: string) {
    try {
        const hashedPassword = await getHashedPassword(password);
        const updateUser = await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                password: hashedPassword,
            }
        });
        if (updateUser) {
            return true;
        }
        else {
            return false;
        }
    } catch (error) {
        console.log('')
        return ({ error });
    }
}

export async function updateUser(email: string, input: Prisma.UserCreateInput): Promise<boolean> {
    try {
        const updateUser = await prisma.user.update({
            where: {
                email: email,
            },
            data: input
        });
        if (updateUser) {
            return true;
        }
        return false;
    } catch (error) {
        console.log('updateUser error: ', error)
        return false
    }
}

export async function findUpdateGoogleUser(email: string, input: GoogleUser): Promise<boolean> {
    try {
        const user = await getUserByEmail(email);
        if (!user) {

            await createUser(input as Prisma.UserCreateInput);
        }
        else {
            await updateUser(email, input as Prisma.UserCreateInput);
        }
        return true;
    } catch (error) {
        console.log('findUpdateGoogleUser error: ', error)
        return false
    }
}

export async function searchUsersByName(name: string): Promise<User[] | null> {
    try {
        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: name.trim(),
                    mode: 'default',
                },
            },
            include: {
                profile: true,
                messages: {
                    include: {
                        messageRecipients: true,
                    }
                }

            }
        })
        return users;
    } catch (error) {
        console.log('searchUsersByName error: ', error)
        return null
    }
}
