'use client';

import { useEffect, useState } from "react";

import { FloatingLabel, Form, Stack } from "react-bootstrap";
import { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import { literal, object, string, TypeOf, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createUserAction } from "../../actions/userAction";

import styles from '../page.module.css';
import { RegisterForm } from "../types";
import FormContainer from "@/components/controls/formContainer";

import * as styled from './styles';
// import { useAddNewUserMutation } from '@/globalRedux/api/usersApi';
// import { useLoginMutation } from '@/globalRedux/api/authApi'
// import { setCredentials } from '@/globalRedux/features/auth/authSlice'

// import { isDuplicatedError } from '@/globalRedux/services/helpers';
// import useAuth from '@/globalRedux/hooks/useAuth'


const registerSchema: ZodType<RegisterForm> = object({
    name: string({ required_error: "이름을 입력하세요", }).min(3, "이름을 3글자 이상으로 입력하세요."),
    password: string({ required_error: "비밀번호를 입력하세요", })
        .min(6, "6글자 이상 비밀번호를 입력하세요."),
    passwordConfirmation: string({ required_error: "비밀번호를 재입력하세요", }).min(6, "위와 동일한 비밀번호를 입력하세요."),
    terms: literal(true, { errorMap: () => ({ message: "이용약관과 개인정보 처리방침을 확인하고 동의해야 합니다." }), }),
    email: string({ required_error: "이메일을 입력하세요", }).email("이메일 형태에 맞게 입력하세요.")
}).refine((data: any) => data.password === data.passwordConfirmation, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirmation"],
});

export type RegisterInput = TypeOf<typeof registerSchema>;

export function RegisterPage() {

    const router = useRouter();

    const { register, formState: { errors }, handleSubmit, reset } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema), });

    const [isModal, setisModal] = useState(false);
    const showModal = () => {
        setisModal(true);
    };

    const ChangeCompleteModal = () => {
        return (
            <styled.Modal>
                <styled.ModalContainer>
                    <styled.ModalTitle>이용약관</styled.ModalTitle>
                    <styled.ModalText>
                        <styled.TermsNumber>제1장</styled.TermsNumber>
                        총칙 제1조 목적 제2조 용어의 정의 제3조 약관의 명시, 효력 및 개정 제4조 관련법령과의 관계 <br /><br />

                        <styled.TermsNumber>제2장</styled.TermsNumber>
                        이용계약 체결 제5조 회원가입 및 이용 계약의 성립 제6조 이용 신청의 승낙과 제한 제7조 개인정보의 보호 및 사용 제8조 회원 ID 부여 및 관리 제9조 회원정보의 변경 제10조 회원의 ID 및 비밀번호 관리의무 제11조 회원에 대한 통지<br /><br />

                        <styled.TermsNumber>제3장</styled.TermsNumber>
                        계약 당사자의 의무 제12조 회사의 의무 제13조 회원의 의무<br /><br />

                        <styled.TermsNumber>제4장</styled.TermsNumber>
                        서비스의 이용 제14조 서비스 제공 제15조 서비스의 변경 제16조 정보의 제공 및 광고의 게재 제17조 게시물의 관리 제18조 게시물의 저작권 제19조 권리의 귀속 제20조 계약 해지 제21조 서비스 이용제한 또는 중지 및 회원 탈퇴 제22조 손해배상 제23조 책임제한 제24조 재판권 및 준거법<br /><br />

                    </styled.ModalText>
                    <styled.ModalOkButton onClick={() => { setisModal(false) }}>
                        <span>닫기</span>
                    </styled.ModalOkButton>
                </styled.ModalContainer>
            </styled.Modal>
        )
    }



    async function onSubmit(values: RegisterForm): Promise<void> {
        try {
            var result = await createUserAction(values);
            if (result === 'email is being useed, use other email') {
                alert('등록된 Email입니다.');
                reset({ 'email': '' });
            }
            else if (result === 'user not created') {
                alert('회원가입을 위하여 관리자에게 문의 하세요.');
                router.push('/');
            }
            else {
                alert('회원가입해 주셔서 감사합니다.');

                router.push('/');
            }

        } catch (error: any) {
            alert('등록되지 않았습니다. 관리자에게 문의 하세요' + JSON.stringify(error));
        }
    }
    return (
        <>
            <FormContainer>
                <form className='border p-4' onSubmit={handleSubmit(onSubmit)}>
                    <div className="d-flex flex-row align-items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" />
                        </svg>
                        <div className=" ms-2 form-outline flex-fill" >
                            <FloatingLabel
                                label="이름"
                                className="mb-1 registerLabel">
                                <Form.Control
                                    id='name'
                                    type='text'
                                    {...register("name")}
                                />
                            </FloatingLabel>
                            <p className={styles.registerError}>{errors.name?.message}</p>
                        </div>
                    </div>
                    <div className="d-flex flex-row align-items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
                        </svg>
                        <div className=" ms-2 form-outline flex-fill">
                            <FloatingLabel
                                label="이메일"
                                className="mb-1 registerLabel">
                                <Form.Control
                                    id='email'
                                    type='email'
                                    {...register("email")}
                                />
                            </FloatingLabel>
                            <p className={styles.registerError}>{errors.email?.message}</p>
                        </div>
                    </div>
                    <div className="d-flex flex-row align-items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" fill="currentColor" className="bi bi-key" viewBox="0 0 16 16">
                            <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8zm4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5z" />
                            <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                        </svg>
                        <div className=" ms-2 form-outline flex-fill">
                            <FloatingLabel
                                label="비밀번호"
                                className="mb-1 registerLabel">
                                <Form.Control
                                    id='password'
                                    type='password'
                                    {...register("password")}
                                />
                            </FloatingLabel>
                            {errors.password && (
                                <p className={styles.registerError}>{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="d-flex flex-row align-items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" fill="currentColor" className="bi bi-repeat" viewBox="0 0 16 16">
                            <path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192Zm3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z" />
                        </svg>
                        <div className=" ms-2 form-outline flex-fill">
                            <FloatingLabel
                                label="비밀번호 확인"
                                className="mb-1 registerLabel">
                                <Form.Control
                                    id='passwordConfirmation'
                                    type='password'
                                    {...register("passwordConfirmation")}
                                />
                            </FloatingLabel>
                            {errors.passwordConfirmation && (
                                <p className={styles.registerError}>{errors.passwordConfirmation.message}</p>
                            )}
                        </div>
                    </div>

                    <div className=" ms-2 form-outline flex-fill" >
                        <Stack direction="horizontal" gap={3} >
                            <Form.Check
                                type="checkbox"
                                id='terms'
                                style={{ fontSize: "9pt" }}
                                {...register("terms")}
                            />
                            <span className='font9'>
                                <a className="link-href" onClick={showModal} >이용약관 및 개인정보 처리방침
                                </a>
                                에 동의합니다.
                                {/* <a className="link-href" href="/auth/membership/" target="_blank">이용약관
                                </a>
                                &nbsp;및&nbsp;
                                <a className="link-href" href="/auth/private-info-policy"
                                    target="_blank">개인정보 처리방침
                                </a>에 동의합니다. */}
                            </span>
                        </Stack>
                        {errors.terms && (
                            <p className={styles.registerError}>{errors.terms.message}</p>
                        )}
                    </div>

                    <div className="row mt-3">
                        <button type="submit" className="btn btn-primary btn-block mb-4" >회원가입</button>
                    </div>

                </form>
            </FormContainer>

            {isModal && <ChangeCompleteModal />}
        </>
    );
}

export default RegisterPage


