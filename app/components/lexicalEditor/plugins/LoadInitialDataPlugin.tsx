import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

const LoadInitialDataPlugin: React.FC<{ initialData: string }> = ({ initialData }) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (initialData) {
            const parsedState = JSON.parse(initialData);

            // console.log('parsedState: ', parsedState)
            // Safely update the editor's state
            editor.update(() => {
                const editorState = editor.parseEditorState(parsedState);
                editor.setEditorState(editorState);
            });
        }
    }, [initialData, editor]);

    return null;
};

export default LoadInitialDataPlugin;