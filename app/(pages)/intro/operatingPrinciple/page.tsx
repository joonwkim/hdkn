'use client'
import Editor from '@/app/components/lexicalEditor/Editor'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation';
import { LexicalDocument } from '@prisma/client';
import { useIntroLayoutContext } from '../layout';

const OperatingPriciplePage = () => {
    const pathname = usePathname();
    const [data, setData] = useState<LexicalDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isUserReadOnly, getContent, saveContent } = useIntroLayoutContext();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getContent(pathname.trim())
                if (result) {
                    setData(result.props)
                }
            } catch {
                setError(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [getContent, pathname]);

    const saveDocument = async (content: string) => {
        saveContent(pathname, content);
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <Editor saveDocument={saveDocument} isReadOnly={isUserReadOnly} initailData={data?.content} />
        </div>
    )
}

export default OperatingPriciplePage