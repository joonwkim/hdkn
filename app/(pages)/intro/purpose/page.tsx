'use client'
import { upsertLexicalDocumentAction } from '@/app/actions/lexicalDocumentAction'
import Editor from '@/app/components/lexicalEditor/Editor'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation';
import { getLexicalDocumentByPath } from '@/app/services/lexicalDocument';
import { LexicalDocument } from '@prisma/client';
import { useSession } from 'next-auth/react';

const PurposePage = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [data, setData] = useState<LexicalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readOnly, setReadOnly] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getLexicalDocumentByPath(pathname.trim())
        if (result.props?.doc?.userId === session?.user.id) {
          setReadOnly(false);
        }
        if (result.props?.doc) {
          setData(result.props?.doc);
        }
      } catch {
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pathname, session?.user.id]);

  const saveDocument = async (content: string) => {
    await upsertLexicalDocumentAction(content, pathname, pathname, session?.user.id)
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {/* <div>{JSON.stringify(pathname)}</div> */}
      {/* <div>{readOnly}</div> */}
      {/* <pre>{`data content: ${JSON.stringify(data?.content, null, 2)}`}</pre> */}
      <Editor saveDocument={saveDocument} isReadOnly={readOnly} initailData={data?.content} />
    </div>
  )
}
export default PurposePage