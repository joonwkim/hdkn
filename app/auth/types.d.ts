import { Role } from "@prisma/client";

interface SessionForm {
    email: string;
    password: string;
}
interface GenericResponse {
    status: string;
    message: string;
}
interface IResetPasswordRequest {
    resetToken: string;
    password: string;
    passwordConfirm: string;
}
interface RegisterForm extends SessionForm {
    name: string;
    password: string
    passwordConfirmation: string;
    terms: boolean
}
interface ProfileChangeForm {
    name: string;
    currentPassword: string;
    newPassword: string;
    newPasswordConfirmation: string;
}

interface GoogleUser {
    name?: string;
    email?: string;
    image?: string;
    roles?: Role[];
    googleLogin: boolean;
    provider?: string,
}
interface TaskInputForm {
    title: string;
    desc: string;
}

