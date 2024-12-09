'use client'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
// Plugin to toggle read-only mode
const ReadOnlyPlugin = ({ isReadOnly }: { isReadOnly: boolean }) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.setEditable(!isReadOnly); // Set editor to editable when not in read-only mode
    }, [editor, isReadOnly]);

    return null;
};

export default ReadOnlyPlugin