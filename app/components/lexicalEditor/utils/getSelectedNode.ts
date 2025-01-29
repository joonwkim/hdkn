import { $isAtNodeEnd } from '@lexical/selection';
import { ElementNode, LexicalNode, ParagraphNode, RangeSelection, RootNode, TextNode } from 'lexical';
import { ImageNode } from '../nodes/ImageNode';

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

export function getImageNodes(rootNode: RootNode): ImageNode[] {
  const imageNodes: ImageNode[] = [];

  const traverse = (node: LexicalNode) => {
    if (node instanceof ImageNode) {
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
  return imageNodes;
}


