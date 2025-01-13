'use client'
import Editor from '@/app/components/lexicalEditor/Editor'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation';
import { LexicalDocument } from '@prisma/client';
import { useIntroLayoutContext } from '../layout';

const PurposePage = () => {
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
    // await upsertLexicalDocumentAction(content, pathname, pathname, session?.user.id)
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {/* <h1>{pathname}</h1> */}
      {/* <div>{JSON.stringify(session, null, 2)}</div> */}
      {/* <div>{readOnly}</div> */}
      {/* <pre>{`data content: ${JSON.stringify(data?.content, null, 2)}`}</pre> */}
      <Editor saveDocument={saveDocument} isReadOnly={isUserReadOnly} initailData={data?.content} />
    </div>
  )
}
export default PurposePage