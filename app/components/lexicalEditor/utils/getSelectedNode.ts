import { $isAtNodeEnd } from '@lexical/selection';
import { $getRoot, ElementNode, LexicalEditor, LexicalNode, ParagraphNode, RangeSelection, TextNode } from 'lexical';
import { ImageNode } from '../nodes/ImageNode';
import { uploadToCloudinary } from '@/app/actions/cloudinary';

export function getSelectedNode(selection: RangeSelection,): TextNode | ElementNode {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}

export function updateImageSrc(editor: LexicalEditor): boolean {
  let updated = true;
  const imageNodes = getImageNodes(editor);
  if (imageNodes.length > 1) {
    updated = false;
    imageNodes.forEach(async (node) => {
      if (node.__src.startsWith("blob:")) {
        try {
          const fd = node.getFormData();
          console.log('node formData fd: ', node.__formData)
          if (fd && fd instanceof FormData) {
            const ci = await uploadToCloudinary(fd)
            if (ci) {
              node.updateSrc(editor, ci.url)
              node.updateAltText(editor, ci.filename)
              updated = true;
            }
          }
        } catch (error) {
          console.error("Failed to upload image:", error);
          throw error;
        }
      }
    })
  }
  return updated;
}

export function getImageNodes(editor: LexicalEditor): ImageNode[] {
  const imageNodes: ImageNode[] = [];

  editor.update(async () => {
    const rootNode = $getRoot();
    const traverse = (node: LexicalNode) => {
      if (node instanceof ImageNode) {
        // console.log('imageNode: ', node)
        imageNodes.push(node)
      }
      if (node instanceof ParagraphNode) {
        node.getChildren().forEach((child) => {
          traverse(child)
        });
      }
    };

    if (rootNode instanceof ElementNode) {
      rootNode.getChildren().forEach((child) => {
        traverse(child)
      });
    }
  })

  return imageNodes;
}
// export function getImageNodes(rootNode: RootNode): ImageNode[] {
//   const imageNodes: ImageNode[] = [];

//   const traverse = (node: LexicalNode) => {
//     if (node instanceof ImageNode) {
//       imageNodes.push(node)
//     }
//     if (node instanceof ParagraphNode) {
//       node.getChildren().forEach((child) => {
//         traverse(child)
//       });
//     }
//   };

//   if (rootNode instanceof ElementNode) {
//     rootNode.getChildren().forEach((child) => {
//       traverse(child)
//     });
//   }
//   return imageNodes;
// }



export function logRootChildren(editor: LexicalEditor) {
  console.log('logRootChildren', editor)
  editor.update(() => {
    const root = $getRoot();
    const children = root.getChildren(); // get an array of child nodes
    children.forEach((child, index) => {
      console.log(`Child ${index}:`, child);
      // Check if child is an ElementNode to safely call getChildren()
      if (child instanceof ElementNode) {
        child.getChildren().forEach((grandchild, idx) => {
          console.log(`Grandchild ${index}-${idx}:`, grandchild);
        });
      }
    });
  });
}
