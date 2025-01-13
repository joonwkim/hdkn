import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { sanitizeLexicalData, } from "../utils/getSelectedNode";
// import { ImageNodeBlobData } from "@/app/lib/types";

const LoadInitialDataPlugin: React.FC<{ initialData: string }> = ({ initialData }) => {
    const [editor] = useLexicalComposerContext();
    const sanitizedData = sanitizeLexicalData(initialData);
    // console.log('sanitizedData: ', sanitizedData);

    useEffect(() => {
        if (sanitizedData) {
        // const parsedState = JSON.parse(sanitizedData);
        // const parsedState = JSON.parse(initialData);
        // console.log('parsedState: ', parsedState);
        // updateImageSrc(parsedState.root);

        // editor.update(() => {
        //     const editorState = editor.parseEditorState(parsedState);
        //     console.log('editorState: ', editorState)
        //     editor.setEditorState(editorState);
        // });

            // const imageNodeBlobData: ImageNodeBlobData[] = searchImageNodeBlobData(editor);
            // console.log('ImageNodeBlobData: ', imageNodeBlobData)
            // removeImageNodeBlobSrc(editor)
        }
    }, [initialData, editor, sanitizedData]);

    return null;
};

export default LoadInitialDataPlugin;