'use server';
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { createUser, getUserByEmail, getUserById, updateUser, updateUserNameAndPassword, updateUserPassword } from "../services/userService";
import { generateRandomPassword, getHashedPassword, verifyPassword, } from "../lib/password";
import { sendMail } from "../lib/mailServer";
import { User } from "@prisma/client";
const jwt = require('jsonwebtoken');

export async function getUserByIdAction(id: string) {
    await getUserById(id);
    revalidatePath('/');
}

export async function updateProfileAction(user: any, data: any) {
    // console.log('checkPasswordAction user and data entered:', user, data)
    if (!user || !user.email || !data) return;
    const userExist: User = await getUserByEmail(user?.email) as User;
    if (!userExist || !userExist.password) {
        return 'userDoesnotExist'
    }
    const result = await verifyPassword(data.currentPassword, userExist.password)
    if (result === 'password do not match') {
        return result;
    }
    else {
        const result = await updateUserNameAndPassword(user, data.newPassword);
        if (result)
            return "profileChanged"
    }
}
export async function createUserAction(input: any) {
    try {
        input.password = await getHashedPassword(input.password);
        delete input.passwordConfirmation;
        const userExist = await getUserByEmail(input.email);
        if (userExist) return 'email is being useed, use other email';
        input.roles = ['USER'];
        input.provider = 'credentials';

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

export async function findUserAction(email: any) {
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

export async function loginAction(input: any) {
    try {
        var user: any = await getUserByEmail(input.email);
        if (!user) return 'user not registered';
        const result = await verifyPassword(input.password, user.password)
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "name": user.name,
                    "email": user.email,
                    "roles": user.roles ? user.roles : [],
                    "image": user.image,
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESSTOKEN_VALID_UNTIL }
        );

        const newRefreshToken = jwt.sign(
            { "email": user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESHTOKEN_VALID_UNTIL }
        );

        const ass_tok = cookies().get('ass_tok');
        return user;
    } catch (error: any) {
        console.log('loginAction error: ', error);
        const errorMessage = error.response.data.message;
        throw error;
    }
}

export async function updateUserAction(id: string, input: any) {
    await updateUser(id, input);
    revalidatePath('/');
}


