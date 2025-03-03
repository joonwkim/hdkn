'use client'
import React, { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useBaseLayoutContext } from '../layout';

const Page = () => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getContent, } = useBaseLayoutContext();
    const [isAuthor, setIsAuthor] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        const fetchData = async () => {
            try {
                const result = await getContent(pathname);

                if (isMountedRef.current && result?.props) {
                    setIsAuthor(result.props.author?.id === session?.user?.id);
                } else {
                    setIsAuthor(false);
                }
            } catch (err) {
                if (isMountedRef.current) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch content');
                }
            } finally {
                if (isMountedRef.current) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => { isMountedRef.current = false; };
    }, [getContent, pathname, session?.user.id]);


    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            
            <div>    {`pathname: ${pathname}`}</div>
            <div>   {`isAuthor: ${isAuthor}`}</div>
        </div>
    );
};

export default Page;
