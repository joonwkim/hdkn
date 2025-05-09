import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState, } from 'lexical';
import { useEffect, useRef } from "react";
import { ImageNode, } from "../nodes/ImageNode";
interface LoadInitialDataPluginProps {
    initialData: string;
    onImageResize?: (node: ImageNode) => void;
}

const LoadInitialDataPlugin: React.FC<LoadInitialDataPluginProps> = ({ initialData, onImageResize }) => {
    const [editor] = useLexicalComposerContext();
    const hasLoaded = useRef<boolean>(false);

    useEffect(() => {
        if (initialData && !hasLoaded.current) {
            hasLoaded.current = true;
            // const imageNodes: ImageNode[] = [];
            queueMicrotask(() => {
                try {
                    const parsedState = JSON.parse(initialData);
                    editor.update(() => {
                        // Parse and set the editor state
                        const editorState: EditorState = editor.parseEditorState(parsedState);
                        editor.setEditorState(editorState);
                    });
                } catch (error) {
                    console.error("Error parsing initial editor state:", error);
                }
            });
        }
    }, [initialData, editor, onImageResize]);

    return null;
};

export default LoadInitialDataPlugin;
