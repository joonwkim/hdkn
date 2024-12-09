import { GoogleUser } from '@/app/auth/types';
import prisma from '@/prisma/prisma';
import { MembershipRequestStatus } from '@prisma/client';
import bcrypt from "bcrypt";
import { getHashedPassword } from '../lib/password';

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

export async function isPasswordValid(email: string, password: string): Promise<boolean> {
    try {
        if (!email || !password) return false;
        var user: any = await getUserByEmail(email);
        const result = await bcrypt.compare(password, user.password).catch((e) => false);
        return result;
    } catch (error: any) {
        const errorMessage = error.response.data.message;
        throw error;
    }
}

export async function createUser(input: any) {
    try {

        const user = await prisma.user.create({ data: input });
        return { user };
    }
    catch (error) {
        return ('user not created');
    }
}

export async function getUserByEmail(emailInput: string) {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: emailInput,
            },
            include: {
                // knowHows:true,
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

        if (user) {
            const requests = user.membershipProcessedBys.filter(s => s.membershipRequestStatus === MembershipRequestStatus.REQUESTED);
            user.notificationCount = requests.length;
            const approvedRequests = user.membershipRequestedBys.filter(s => s.membershipRequestStatus === MembershipRequestStatus.APPROVED)
            user.notificationCount += approvedRequests.length;
        }

        return user;
    } catch (error) {
        return ({ error });
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

export async function updateUserNameAndPassword(user: any, password: any) {
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
export async function updateUserPassword(email: string, password: any) {
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

export async function updateUser(email: string, input: any) {
    try {
        const updateUser = await prisma.user.update({
            where: {
                email: email,
            },
            data: input
        });
    } catch (error) {
        console.log('')
        return ({ error });
    }
}

export async function findUpdateGoogleUser(email: string, input: GoogleUser) {
    try {


        let user = await getUserByEmail(email);
        if (!user) {
            const userCreated = await createUser(input);
        }
        else {
            const userStored = user as GoogleUser;
            input.roles = userStored.roles;
            const userUpdated = await updateUser(email, input);
        }
        return true;
    } catch (error) {
        return ({ error });
    }
}

export async function searchUsersByName(name: string) {
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
        console.log("searchUsersByName:", searchUsersByName)
    }
}