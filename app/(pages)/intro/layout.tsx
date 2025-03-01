'use client'

import { upsertLexicalDocumentAction } from "@/app/actions/lexicalDocumentAction";
import { getLexicalDocumentByPath } from "@/app/services/lexicalDocument";
import { LexicalDocument } from "@prisma/client";
import { useSession } from "next-auth/react";
import React, { createContext, useContext, } from 'react';

interface IntroContextProps {
    isUserReadOnly: boolean;
    getContent: (pathName: string) => Promise<{ props: LexicalDocument, revalidate: number } | null>;
    saveContent: (pathName: string, content: string) => void;
}

const IntroLayoutContext = createContext<IntroContextProps | undefined>(undefined);

export const useIntroLayoutContext = () => {
    const context = useContext(IntroLayoutContext);
    if (!context) {
        throw new Error('useGroupLayoutContext must be used within GroupLayout');
    }
    return context;
};

const IntroLayout = ({ children, }: { children: React.ReactNode }) => {
    const { data: session } = useSession();
    const isUserReadOnly = session?.user ? session.user.isUserReadOnly : true;

    const saveContent = async (pathName: string, content: string) => {
        await upsertLexicalDocumentAction(content, pathName, pathName, session?.user.id)
    }
    const getContent = async (pathName: string): Promise<{ props: LexicalDocument, revalidate: number } | null> => {
        const result = await getLexicalDocumentByPath(pathName.trim())
        return result;
    }
    return (
        <IntroLayoutContext.Provider value={{ isUserReadOnly, getContent, saveContent }}>
            <div>
                {/* {`ReadOnly: ${isUserReadOnly}`} */}
                <main>{children}</main>
            </div>
        </IntroLayoutContext.Provider>      
    )
}

export default IntroLayout