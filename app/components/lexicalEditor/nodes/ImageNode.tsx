import { $applyNodeReplacement, createEditor, DecoratorNode, DOMConversionMap, DOMConversionOutput, DOMExportOutput, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedEditor, SerializedLexicalNode, Spread } from "lexical";
import * as React from 'react';
import { Suspense } from "react";
import { Position } from "./InlineImageNode";

const ImageComponent = React.lazy(() => import('./ImageComponent'));

export interface ImagePayload {
    altText: string;
    caption?: LexicalEditor;
    height?: number;
    key?: NodeKey;
    maxWidth?: number;
    showCaption?: boolean;
    src: string;
    width?: number;
    captionsEnabled?: boolean;
    position?: Position;
    formData?: FormData;
}

function isGoogleDocCheckboxImg(img: HTMLImageElement): boolean {
    return (
        img.parentElement != null &&
        img.parentElement.tagName === 'LI' &&
        img.previousSibling === null &&
        img.getAttribute('aria-roledescription') === 'checkbox'
    );
}

function $convertImageElement(domNode: Node): null | DOMConversionOutput {
    const img = domNode as HTMLImageElement;
    if (img.src.startsWith('file:///') || isGoogleDocCheckboxImg(img)) {
        return null;
    }
    const { alt: altText, src, width, height } = img;
    const node = $createImageNode({ altText, height, src, width });
    return { node };
}

export type SerializedImageNode = Spread<{ altText: string; caption: SerializedEditor; height?: number; maxWidth?: number; showCaption: boolean; src: string; width?: number; position?: Position; formData?: FormData }, SerializedLexicalNode>;
export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __altText: string;
    __width?: number;
    __height?: number;
    __maxWidth?: number; 
    __showCaption: boolean;
    __caption: LexicalEditor;
    __position?: Position;
    __captionsEnabled: boolean;
    __formData?: FormData;

    static getType(): string {
        return 'image';
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(node.__src, node.__altText, node.__maxWidth, node.__width, node.__height, node.__showCaption, node.__caption, node.__captionsEnabled, node.__key, node.__position, node.__formData);
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { altText, height, width, maxWidth, caption, src, showCaption, formData } = serializedNode;
        const node = $createImageNode({ altText, height, maxWidth, showCaption, src, width, formData });
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
                conversion: $convertImageElement,
                priority: 0,
            }),
        };
    }

    constructor(src: string, altText: string, maxWidth?: number, width?: number, height?: number, showCaption?: boolean, caption?: LexicalEditor, captionsEnabled?: boolean, key?: NodeKey, position?: Position, formData?: FormData) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__maxWidth = maxWidth;
        this.__width = width;
        this.__height = height;
        this.__showCaption = showCaption || false;
        this.__caption = caption || createEditor({ nodes: [], });
        this.__captionsEnabled = captionsEnabled || captionsEnabled === undefined;
        this.__position = position;
        this.__formData = formData;
    }

    getAltText(): string {
        return this.__altText;
    }
    getFormData(): FormData | undefined {
        return this.__formData;
    }

    getSrc(): string {
        return this.__src;
    }

    setSrc(src: string) {
        this.__src = src;
    }

    setWidthAndHeight(width: number, height: number,): void {
        const writable = this.getWritable();
        writable.__width = width;
        writable.__height = height;
    }

    updateSrc(newSrc: string) {
        const self = this.getWritable();
        self.__src = newSrc
        console.log('src: ', self.__src)
    }
    updateAltText(altText: string) {
        const self = this.getWritable();
        self.__altText = altText;
    }

    setShowCaption(showCaption: boolean): void {
        const writable = this.getWritable();
        writable.__showCaption = showCaption;
    }

    exportJSON(): SerializedImageNode {
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
            formData: this.__formData,
        };
    }

    createDOM(config: EditorConfig): HTMLElement {
        if (this.__position && this.__width) {
            const span = document.createElement('span');
            const theme = config.theme;
            const className = `${theme.image} position-${this.__position}`;
            if (className !== undefined) {
                span.className = className;
            }
            return span;
        } else {

            const span = document.createElement('span');
            const theme = config.theme;
            const className = theme.image;
            if (className !== undefined) {
                span.className = className;
            }
            return span;
        }

    }

    updateDOM(): false {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('img');
        element.setAttribute('src', this.__src);
        element.setAttribute('alt', this.__altText);
        element.setAttribute('width', this.__width ? this.__width.toString() : '');
        element.setAttribute('height', this.__height ? this.__height.toString() : '');
        return { element };
    }

    decorate(): JSX.Element {
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

export function $createImageNode({ altText, height, maxWidth, captionsEnabled, src, width, showCaption, caption, key, position, formData }: ImagePayload): ImageNode {
    return $applyNodeReplacement(new ImageNode(src, altText, maxWidth, width, height, showCaption, caption, captionsEnabled, key, position, formData));
}

export function $isImageNode(node: LexicalNode | null | undefined,): node is ImageNode {
    return node instanceof ImageNode;
}