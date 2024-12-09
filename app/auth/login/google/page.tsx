'use client';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextRequest } from 'next/server';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { setCredentials } from '@/globalRedux/features/auth/authSlice'

export default function GoogleLogin({ searchParams }: { searchParams: any; }) {
  const router = useRouter();

  // console.log('request:', searchParams.accessToken)


  useEffect(() => {

    try {
      const accessToken = searchParams.accessToken;
      if (accessToken) {
        // console.log('accessToken:', accessToken)
        // dispatch(setCredentials({ accessToken }))
        // router.push('/');
      }

    } catch (error: any) {
      console.log('GoogleLogin error:', error);
      throw 'GoogleLogin error:';
    }

  }, [router, searchParams.accessToken]);
  return (
    <div>GoogleLogin</div>
  );
}
