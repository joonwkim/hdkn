import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";

const LoadInitialDataPlugin: React.FC<{ initialData: string }> = ({ initialData }) => {
    const [editor] = useLexicalComposerContext();
    const hasLoaded = useRef(false);

    useEffect(() => {
        if (initialData && !hasLoaded.current) {
            hasLoaded.current = true; // Prevent multiple updates
            queueMicrotask(() => {
                try {
                    const parsedState = JSON.parse(initialData);
                    editor.update(() => {
                        const editorState = editor.parseEditorState(parsedState);
                        editor.setEditorState(editorState);
                    });
                } catch (error) {
                    console.error('Error parsing initial editor state:', error);
                }
            });
        }
    }, [initialData, editor]);

    return null;
};

export default LoadInitialDataPlugin;