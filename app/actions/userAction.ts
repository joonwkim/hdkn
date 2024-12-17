'use server';
import { revalidatePath } from "next/cache";
import { createUser, getUserByEmail, updateUser, updateUserPassword } from "../services/userService";
import { generateRandomPassword, getHashedPassword, verifyPassword, } from "../lib/password";
import { sendMail } from "../lib/mailServer";
import { RegisterForm } from "../auth/types";
import { Prisma, User } from "@prisma/client";

export async function createUserAction(input: RegisterForm) {
    try {
        input.password = await getHashedPassword(input.password);
        // delete input.passwordConfirmation;
        const userExist = await getUserByEmail(input.email);
        if (userExist) return 'email is being useed, use other email';
        // input.roles = ['USER'];
        // input.provider = 'credentials';

        const createdUser = await createUser(input);
        if (!createdUser) return 'user not created';

    } catch (error) {
        console.log('createUserAction', error)
        return ('user not created');
    }
}

export async function sendNewPasswordAction(email: string) {
    // console.log('email in sendNewPasswordAction:', email)
    const user = await getUserByEmail(email);
    if (user) {
        const newPassword = generateRandomPassword();
        // const passwordHashed = await getHashedPassword(newPassword);
        await updateUserPassword(email, newPassword);

        sendMail(email, newPassword)
        return true;
    }
    else {
        return false
    }
}

export async function findUserAction(email: string) {
    try {
        const user = await getUserByEmail(email);
        if (!user) return 'user not registered';
        if (user.googleLogin) return 'googleLoginUser'
        return 'user';

    } catch (error) {
        console.log('findUserAction error: ', error);
        return 'user not registered';
    }
}

export async function updateUserAction(id: string, input: Prisma.UserCreateInput) {
    await updateUser(id, input);
    revalidatePath('/');
}


