import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState, } from 'lexical';

import { useEffect, useRef } from "react";
import { ImageNode, } from "../nodes/ImageNode";
// import { $isImageNode, ImageNode, ResizedImage } from "../nodes/ImageNode";
// import { getImageNodes, } from "../utils/getSelectedNode";
// import { resizeCloudinaryImage, } from "@/app/actions/cloudinary";

interface LoadInitialDataPluginProps {
    initialData: string;
    onImageResize?: (node: ImageNode) => void;
}

const LoadInitialDataPlugin: React.FC<LoadInitialDataPluginProps> = ({ initialData, onImageResize }) => {
    const [editor] = useLexicalComposerContext();
    const hasLoaded = useRef<boolean>(false);

    // const callback = async (resizedImage: ResizedImage) => {
    //     console.log('callback resizedImage: ', resizedImage)
    //     const result = await resizeCloudinaryImage(resizedImage);
    //     console.log('callback result: ', result)
    //     // alert(JSON.stringify(result))
    // }

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

        // logRootChildren(editor)

        // const imageNodes = getImageNodes(editor)
        // console.log('imageNodes', imageNodes)

        // editor.update(() => {
        //     imageNodes.forEach((node) => {
        //         // console.log('imageNode:', node)
        //         if ($isImageNode(node) && !node.__resizeCallbackAdded) {
        //             node.setResizeCallback(callback);
        //         }

        //     })
        // });



    }, [initialData, editor, onImageResize]);

    return null;
};

export default LoadInitialDataPlugin;
