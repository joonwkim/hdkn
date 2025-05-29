'use client'
import Editor from '@/app/components/lexicalEditor/Editor'
import React, { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation';
import { LexicalDocument, User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useIntroLayoutContext } from '../../layout';

const Page = () => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [data, setData] = useState<LexicalDocument & { author: User } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getContent, saveContent } = useIntroLayoutContext();
    const [isAuthor, setIsAuthor] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        const fetchData = async () => {
            try {
                const result = await getContent(pathname);

                if (isMountedRef.current && result?.props) {
                    setData(result.props);
                    setIsAuthor(result.props.author?.id === session?.user?.id);
                } else {
                    setData(null);
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

    const saveDocument = async (content: string) => {
        saveContent(pathname, content);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            {`Path: ${pathname}`}
            <Editor saveDocument={saveDocument} isReadOnly={!isAuthor} initialData={data?.content} />
        </div>
    );
};

export default Page;
