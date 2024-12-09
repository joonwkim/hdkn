import { $applyNodeReplacement, createEditor, DecoratorNode, DOMConversionMap, DOMConversionOutput, DOMExportOutput, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedEditor, SerializedLexicalNode, Spread } from 'lexical';
import './styles.css'
const ImageComponent = React.lazy(() => import('./ImageComponent'));

export type Position = 'left' | 'right' | 'full' | undefined;
export interface InlineImagePayload {
  altText: string;
  caption?: LexicalEditor;
  height?: number;
  key?: NodeKey;
  showCaption?: boolean;
  src: string;
  width?: number;
  maxWidth?: number;
  position?: Position;
  captionsEnabled?: boolean;
}

// import Image from 'next/image';
import { Suspense } from 'react';
// import InlineImageComponent from './InlineImageComponent';
import React from 'react';
// import ImageComponent from 'next/image';
export interface UpdateInlineImagePayload {
  altText?: string;
  showCaption?: boolean;
  position?: Position;
}

function $convertInlineImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode;
    const node = $createInlineImageNode({ altText, height, src, width });
    return { node };
  }
  return null;
}
export type SerializedInlineImageNode = Spread<{ altText: string; caption: SerializedEditor; height?: number; maxWidth?: number; showCaption: boolean; src: string; width?: number; position?: Position; }, SerializedLexicalNode>;

export class InlineImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width?: number;
  __height?: number;
  __maxWidth?: number;
  __showCaption: boolean;
  __caption: LexicalEditor;
  __position: Position;
  __captionsEnabled: boolean;

  static getType(): string {
    return 'inline-image';
  }

  static clone(node: InlineImageNode): InlineImageNode { return new InlineImageNode(node.__src, node.__altText, node.__position, node.__maxWidth, node.__width, node.__height, node.__showCaption, node.__caption, node.__captionsEnabled, node.__key,); }

  static importJSON(serializedNode: SerializedInlineImageNode,): InlineImageNode {
    const { altText, height, width, caption, src, showCaption, position } = serializedNode;
    const node = $createInlineImageNode({ altText, height, position, showCaption, src, width, });
    const nestedEditor = node.__caption;
    const editorState = nestedEditor.parseEditorState(caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return node;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: $convertInlineImageElement,
        priority: 0,
      }),
    };
  }

  constructor(src: string, altText: string, position: Position, maxWidth?: number, width?: number, height?: number, showCaption?: boolean, caption?: LexicalEditor, captionsEnabled?: boolean, key?: NodeKey,) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__maxWidth = maxWidth;
    this.__height = height;
    this.__showCaption = showCaption || false;
    this.__caption = caption || createEditor();
    this.__position = position;
    this.__captionsEnabled = captionsEnabled || captionsEnabled === undefined;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    element.setAttribute('width', this.__width ? this.__width.toString() : '');
    element.setAttribute('height', this.__height ? this.__height.toString() : '');
    return { element };
  }

  exportJSON(): SerializedInlineImageNode {
    return {
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      height: this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.__width,
    };
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  setAltText(altText: string): void {
    const writable = this.getWritable();
    writable.__altText = altText;
  }

  setWidthAndHeight(width: number, height: number,): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }


  getShowCaption(): boolean {
    return this.__showCaption;
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }

  getPosition(): Position {
    return this.__position;
  }

  setPosition(position: Position): void {
    const writable = this.getWritable();
    writable.__position = position;
  }

  update(payload: UpdateInlineImagePayload): void {
    const writable = this.getWritable();
    const { altText, showCaption, position } = payload;
    if (altText !== undefined) {
      writable.__altText = altText;
    }
    if (showCaption !== undefined) {
      writable.__showCaption = showCaption;
    }
    if (position !== undefined) {
      writable.__position = position;
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const className = `${config.theme.inlineImage} position-${this.__position}`;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(prevNode: InlineImageNode, dom: HTMLElement, config: EditorConfig,): false {
    const position = this.__position;
    if (position !== prevNode.__position) {
      const className = `${config.theme.inlineImage} position-${position}`;
      if (className !== undefined) {
        dom.className = className;
      }
    }
    return false;
  }

  decorate() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ImageComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          maxWidth={this.__maxWidth}
          height={this.__height}
          nodeKey={this.getKey()}
          showCaption={this.__showCaption}
          caption={this.__caption}
          position={this.__position}
          captionsEnabled={this.__captionsEnabled}
          resizable={true}
        />
      </Suspense>
    );
  }
}

export function $createInlineImageNode({ altText, position, height, src, maxWidth, width, showCaption, caption, captionsEnabled, key, }: InlineImagePayload): InlineImageNode {
  return $applyNodeReplacement(
    new InlineImageNode(src, altText, position, maxWidth, width, height, showCaption, caption, captionsEnabled, key,),
  );
}

export function $isInlineImageNode(node: LexicalNode | null | undefined,): node is InlineImageNode {
  return node instanceof InlineImageNode;
}