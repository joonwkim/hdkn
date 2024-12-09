'use client'
// import { upsertLexicalDocumentAction } from '@/app/actions/lexicalDocumentAction'
// import Editor from '@/app/components/lexicalEditor/Editor'
import React from 'react'
// import React, { useEffect, useState } from 'react'
// import { usePathname } from 'next/navigation';
// import { getLexicalDocumentByPath } from '@/app/services/lexicalDocument';
// import { LexicalDocument } from '@prisma/client';

const PurposePage = () => {
  // const pathname = usePathname();
  // const [data, setData] = useState<LexicalDocument|null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const result = await getLexicalDocumentByPath(pathname) 
  //       console.log('result: ', result)
  //       if (result.props?.doc) {
  //         setData(result.props?.doc);
  //       }
  //     } catch  {
  //       setError(null);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [pathname]);
  // const saveDocument = async(content: string) => {
  //   await upsertLexicalDocumentAction(content, pathname)   
  // }

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Fetched Data:</h1>
      {/* <h1>Fetched Data:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre> */}
      {/* <Editor saveDocument={saveDocument} isReadOnly={false}/> */}
    </div>

  )
}

export default PurposePage