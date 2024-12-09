import { error } from 'console';
import nodemailer from 'nodemailer';

export const sendMail = (email: string, message: string) => {
    try {
        const transport = nodemailer.createTransport({
            // host: 'smtp.gmail.com',
            // port: 465,
            // secure: true,
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PSSWD,
            },
        })

        const mailOptions = {
            from: "joonwk@gmail.com",
            to: email,
            subject: '새로운 비밀번호안내(openplace.com) - no reply',
            html: `
                <h3>비밀번호 복구 안내 - No reply needed.</h3>
                <p>아래 비밀번호로 오프플에이스에 로그인 할 수 있습니다.</p>
                <p>메일 주소: ${email}</p>
                <p>비밀번호: ${message}</p>
            `
        }

        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('send mail error: ', error)
            } else {
                console.log('Email send: ', info.response)
            }
        })

        return true;
    } catch (error) {
        return false;
    }


}