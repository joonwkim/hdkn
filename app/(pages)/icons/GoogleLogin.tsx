import React from 'react'
import Image from "next/image";
import { signIn } from "next-auth/react";
const GoogleLogin = () => {
    const googleLogin = () => {
        signIn('google', { callbackUrl: '/' });
    };
    return (
        <div className='ms-2 d-flex'>
            <button className="btn btn-outline-light border border-0 me-3" onClick={() => googleLogin()} title='로그인'>
                <Image
                    src='https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg'
                    alt="google login"
                    width={24}
                    height={20}
                    style={{
                        cursor: 'pointer',
                        maxWidth: "100%",
                        height: "auto"
                    }} />
            </button>
        </div>
    )
}

export default GoogleLogin