import { $isAtNodeEnd } from '@lexical/selection';
import { $getRoot, $isElementNode, EditorState, ElementNode, LexicalEditor, LexicalNode, RangeSelection, TextNode } from 'lexical';
import { $isImageNode, ImageNode } from '../nodes/ImageNode';
import { ImageNodeBlobData } from '@/app/lib/types';

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

export function sanitizeLexicalData(lexicalData: string) {
  const parsedData = JSON.parse(lexicalData);
  // console.log('parsedData: ', parsedData)

  const va = Object.values(parsedData.root);
  // console.log('va:', va)

  // Recursive function to traverse and sanitize nodes
  function traverse(node: LexicalNode) {
    // console.log('traverse')
    // console.log('traverse typeof node: ', typeof node)
    // console.log('traverse node: ', node)

    if (node instanceof ImageNode) {
      console.log('traverse node instanceof ImageNode: ', node)
      node.setSrc(' ')
    }
    // Traverse child nodes if they exist
    if (node instanceof ElementNode) {
      console.log('traverse node instanceof ElementNode: ', node)
      node.getChildren().forEach(traverse);
    }
    // if (typeof node === 'object') {
    //   const va = Object.values(node);
    //   console.log('typeof node === object:', va)
    //   // for (const obj of Object.entries(node)) {
    //   //   console.log('const obj of Object.entries(node) obj: ', obj)

    //   // }
    // }
    if (Array.isArray(node)) {
      console.log('Array.isArray(node) ')
      // node.forEach(traverse);
    }
  }

  // console.log('typeof parsedData: ', typeof parsedData)
  // Start traversal from the root node
  if (Array.isArray(va)) {
    console.log('parsedData.root.forEach(traverse) ')
    va.forEach((d) => {
      console.log('iteration', d);
    })
    // parsedData.root.getChildren().forEach(traverse);
  } else {
    // console.log('parsedData.root: ', parsedData.root)
    traverse(parsedData.root);
  }

  const sanitiezed = JSON.stringify(parsedData)
  // console.log('sanitiezed: ', sanitiezed);
  return sanitiezed;
  // return JSON.stringify(parsedData);
}


export function updateImageSrc(node: LexicalNode) {
  const traverse = (node: LexicalNode) => {
    if (node instanceof ImageNode) {
      const src = node.getSrc();

      node.setSrc('');

      console.log('src:', src)
    }
  };
  if (node instanceof ElementNode) {
    node.getChildren().forEach(traverse); // Recursively check child nodes
  }

};

export const removeImageNodeBlobSrc = (editor: LexicalEditor) => {
  const traverse = (node: LexicalNode) => {
    if (node instanceof ImageNode) {
      const src = node.getSrc();

      node.setSrc('');

      console.log('src:', src)
    }
    // Check if the node is an instance of ElementNode (can have children)
    if (node instanceof ElementNode) {
      node.getChildren().forEach(traverse); // Recursively check child nodes
    }
  };

  editor.update(() => {
    const root = $getRoot();
    root.getChildren().forEach(traverse); // Start traversal from the root
  });


};
export const searchImageNodeBlobData = (editor: LexicalEditor): ImageNodeBlobData[] => {
  const results: ImageNodeBlobData[] = [];

  const traverse = (node: LexicalNode) => {
    if (node instanceof ImageNode) {
      const bd: ImageNodeBlobData = {
        key: node.getKey(),
        src: node.getSrc(),
      }
      results.push(bd);
    }
    // Check if the node is an instance of ElementNode (can have children)
    if (node instanceof ElementNode) {
      node.getChildren().forEach(traverse); // Recursively check child nodes
    }
  };

  editor.update(() => {
    const root = $getRoot();
    root.getChildren().forEach(traverse); // Start traversal from the root
  });

  return results;
};


export const searchNodesByType = (editor: LexicalEditor, type: string): LexicalNode[] => {
  const results: LexicalNode[] = [];

  const traverse = (node: LexicalNode) => {
    if (node.getType() === type) {
      results.push(node);
    }

    // Check if the node is an instance of ElementNode (can have children)
    if (node instanceof ElementNode) {
      node.getChildren().forEach(traverse); // Recursively check child nodes
    }
  };

  editor.update(() => {
    const root = $getRoot();
    root.getChildren().forEach(traverse); // Start traversal from the root
  });

  return results;
};


export function getBlobUrls(editorState: EditorState) {
  const blobUrls: string[] = [];
  editorState.read(() => {
    const root = $getRoot();
    const traverseNodes = (node: LexicalNode) => {
      if ($isImageNode(node)) {
        const src = node.getSrc();
        if (src.startsWith('blob:')) {
          blobUrls.push(src);
        }
      }
      if ($isElementNode(node)) {
        node.getChildren().forEach(traverseNodes);
      }
    };
    traverseNodes(root);
  });
  return blobUrls;
}

export async function fetchBlobData(blobUrls: string[]): Promise<Buffer[]> {
  const buffers: Buffer[] = [];
  blobUrls.forEach(async (blobUrl) => {
    const response = await fetch(blobUrl);
    const arrayBuffer = await response.arrayBuffer();
    buffers.push(Buffer.from(arrayBuffer));
  })
  return buffers;
}
