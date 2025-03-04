'use client'

import { upsertLexicalDocumentAction } from "@/app/actions/lexicalDocumentAction";
import { getLexicalDocumentByPath } from "@/app/services/lexicalDocument";
import { LexicalDocument, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import React, { createContext, useContext, } from 'react';

interface BaseContextProps {
    getContent: (pathName: string) => Promise<{ props: LexicalDocument & { author: User }, revalidate: number } | null>;
    saveContent: (pathName: string, content: string) => void;
}

const BaseLayoutContext = createContext<BaseContextProps | undefined>(undefined);

export const useIntroLayoutContext = () => {
    const context = useContext(BaseLayoutContext);
    if (!context) {
        throw new Error('useGroupLayoutContext must be used within GroupLayout');
    }
    return context;
};

const IntroLayout = ({ children, }: { children: React.ReactNode }) => {
    const { data: session } = useSession();
    const saveContent = async (pathName: string, content: string) => {
        await upsertLexicalDocumentAction(content, pathName, pathName, session?.user.id)
    }
    const getContent = async (pathName: string): Promise<{ props: LexicalDocument & { author: User }, revalidate: number } | null> => {
        const result = await getLexicalDocumentByPath(pathName.trim())
        return result;
    }
    return (
        <BaseLayoutContext.Provider value={{ getContent, saveContent }}>
            <div>
                <main>{children}</main>
            </div>
        </BaseLayoutContext.Provider>
    )
}

export default IntroLayout