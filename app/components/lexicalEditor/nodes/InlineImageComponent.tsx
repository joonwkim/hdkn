import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { $getNodeByKey, $getSelection, $isNodeSelection, $setSelection, BaseSelection, CLICK_COMMAND, COMMAND_PRIORITY_LOW, DRAGSTART_COMMAND, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, LexicalEditor, NodeKey, SELECTION_CHANGE_COMMAND } from 'lexical';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { $isInlineImageNode, Position } from './InlineImageNode';
import { mergeRegister } from '@lexical/utils';
import Image from 'next/image'
import ImageResizer from './ImageResizer';
import './styles.css'

const imageCache = new Set();

function useSuspenseImage(src: string) {
    if (!imageCache.has(src)) {
        throw new Promise((resolve) => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
                imageCache.add(src);
                resolve(null);
            };
        });
    }
}

interface LazyImageProps {
    altText: string;
    className: string | null;
    height: 'inherit' | number;
    imageRef: { current: null | HTMLImageElement };
    src: string;
    width: 'inherit' | number;
    position: Position;
    onError: () => void;
}

function LazyImage({ altText, className, imageRef, src, width, height, onError }: LazyImageProps): JSX.Element {
    useSuspenseImage(src);
    return (
        <div>
            {/* <div>{`altText:${altText}`}</div>
            <div>{`className:${className}`}</div>
            <div>{`imageRef:${imageRef}`}</div>
            <div>{`src:${src}`}</div>
            <div>{`width:${width}`}</div>
            <div>{`height:${height}`}</div>
            <div>{`position:${position}`}</div> */}
            {typeof width === 'number' && typeof height === 'number' && <>
                <Image
                    src={src}
                    alt={altText}
                    width={width}
                    height={height} // a Height obtained from file metadata     
                    onError={onError}
                />
            </>}
            {typeof width === 'number' && height === 'inherit' && <>
                <Image
                    className={className || undefined}
                    ref={imageRef}
                    src={src}
                    alt={altText}
                    style={{ maxWidth: width, height: 'auto', width: '100%' }}
                    width={width}
                    height={0}
                    loading="lazy"
                    draggable="false"
                    onError={onError}
                />

            </>}


        </div>


    );
}

interface InlineImageComponentProps {
    altText: string;
    caption: LexicalEditor;
    height: 'inherit' | number;
    nodeKey: NodeKey;
    showCaption: boolean;
    src: string;
    width: 'inherit' | number;
    position: Position;
    resizable: boolean;
    captionsEnabled: boolean;
}

export default function InlineImageComponent({ src, altText, nodeKey, width, height, showCaption, caption, position, resizable, captionsEnabled }: InlineImageComponentProps): JSX.Element {
    const imageRef = useRef<null | HTMLImageElement>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const [editor] = useLexicalComposerContext();
    const [selection, setSelection] = useState<BaseSelection | null>(null);
    const activeEditorRef = useRef<LexicalEditor | null>(null);
    const [isResizing, setIsResizing] = useState<boolean>(false);
    const [isLoadError, setIsLoadError] = useState<boolean>(false);

    const $onDelete = useCallback(
        (payload: KeyboardEvent) => {
            const deleteSelection = $getSelection();
            if (isSelected && $isNodeSelection(deleteSelection)) {
                const event: KeyboardEvent = payload;
                event.preventDefault();
                if (isSelected && $isNodeSelection(deleteSelection)) {
                    editor.update(() => {
                        deleteSelection.getNodes().forEach((node) => {
                            if ($isInlineImageNode(node)) {
                                node.remove();
                            }
                        });
                    });
                }
            }
            return false;
        },
        [editor, isSelected],
    );

    const $onEnter = useCallback(
        (event: KeyboardEvent) => {
            const latestSelection = $getSelection();
            const buttonElem = buttonRef.current;
            if (
                isSelected &&
                $isNodeSelection(latestSelection) &&
                latestSelection.getNodes().length === 1
            ) {
                if (showCaption) {
                    // Move focus into nested editor
                    $setSelection(null);
                    event.preventDefault();
                    caption.focus();
                    return true;
                } else if (
                    buttonElem !== null &&
                    buttonElem !== document.activeElement
                ) {
                    event.preventDefault();
                    buttonElem.focus();
                    return true;
                }
            }
            return false;
        },
        [caption, isSelected, showCaption],
    );

    const $onEscape = useCallback((event: KeyboardEvent) => {
        if (activeEditorRef.current === caption || buttonRef.current === event.target) {
            $setSelection(null);
            editor.update(() => {
                setSelected(true);
                const parentRootElement = editor.getRootElement();
                if (parentRootElement !== null) {
                    parentRootElement.focus();
                }
            });
            return true;
        }
        return false;
    },
        [caption, editor, setSelected],
    );

    const onClick = useCallback((payload: MouseEvent) => {
        const event = payload;
        if (isResizing) {
            return true;
        }
        if (event.target === imageRef.current) {
            if (event.shiftKey) {
                setSelected(!isSelected);
            } else {
                clearSelection();
                setSelected(true);
            }
            return true;
        }

        return false;
    },
        [isResizing, isSelected, setSelected, clearSelection],
    );

    useEffect(() => {
        let isMounted = true;
        const unregister = mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                if (isMounted) {
                    setSelection(editorState.read(() => $getSelection()));
                }
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_, activeEditor) => {
                    activeEditorRef.current = activeEditor;
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand<MouseEvent>(
                CLICK_COMMAND,
                (payload) => {
                    const event = payload;
                    onClick(payload);
                    if (event.target === imageRef.current) {
                        if (event.shiftKey) {
                            setSelected(!isSelected);
                        } else {
                            clearSelection();
                            setSelected(true);
                        }
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                DRAGSTART_COMMAND,
                (event) => {
                    if (event.target === imageRef.current) {
                        // TODO This is just a temporary workaround for FF to behave like other browsers.
                        // Ideally, this handles drag & drop too (and all browsers).
                        event.preventDefault();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_DELETE_COMMAND,
                $onDelete,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                $onDelete,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                $onEscape,
                COMMAND_PRIORITY_LOW,
            ),
        );
        return () => {
            isMounted = false;
            unregister();
        };
    }, [clearSelection, editor, isSelected, nodeKey, $onDelete, $onEnter, $onEscape, setSelected, onClick]);

    const setShowCaption = () => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isInlineImageNode(node)) {
                node.setShowCaption(true);
            }
        });
    };

    const onResizeEnd = (
        nextWidth: 'inherit' | number,
        nextHeight: 'inherit' | number,
    ) => {
        // Delay hiding the resize bars for click case
        setTimeout(() => {
            setIsResizing(false);
        }, 200);

        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isInlineImageNode(node)) {
                node.setWidthAndHeight(Number.parseInt(nextWidth.toString()), Number.parseInt(nextHeight.toString()));
            }
        });
    };

    const onResizeStart = () => {
        setIsResizing(true);
    };
    const draggable = isSelected && $isNodeSelection(selection);
    const isFocused = isSelected;
    return (
        <Suspense fallback={null}>
            <>
                <span draggable={draggable}>
                    {/* <button
                        className="image-edit-button"
                        ref={buttonRef}
                        onClick={() => {
                            showModal('Update Inline Image', (onClose) => (
                                <UpdateInlineImageDialog
                                    activeEditor={editor}
                                    nodeKey={nodeKey}
                                    onClose={onClose}
                                />
                            ));
                        }}>
                        Edit
                    </button> */}
                    <LazyImage className={isFocused ? `focused ${$isNodeSelection(selection) ? 'draggable' : ''}` : null}
                        src={src}
                        altText={altText}
                        imageRef={imageRef}
                        width={width}
                        height={height}
                        position={position}
                        onError={() => setIsLoadError(true)}
                    />
                </span>
                {showCaption && (
                    <span className="image-caption-container">
                        <LexicalNestedComposer initialEditor={caption}>
                            <AutoFocusPlugin />
                            <RichTextPlugin contentEditable={
                                <ContentEditable
                                    className="image-capton-content-input"
                                    aria-placeholder='Enter a caption'
                                    placeholder={
                                        <div className="editor-placeholder">Enter a caption</div>
                                    }
                                />
                            }
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                        </LexicalNestedComposer>
                    </span>
                )}

                {/* <div>{`resizable: ${resizable}`}</div>
                <div>{`$isNodeSelection(selection): ${$isNodeSelection(selection)}`}</div>
                <div>{`isFocused: ${isFocused}`}</div> */}

                {resizable && $isNodeSelection(selection) && isFocused && (
                    <ImageResizer
                        showCaption={showCaption}
                        setShowCaption={setShowCaption}
                        editor={editor}
                        buttonRef={buttonRef}
                        imageRef={imageRef}
                        maxWidth={typeof width === 'number' ? width : 500}
                        onResizeStart={onResizeStart}
                        onResizeEnd={onResizeEnd}
                        captionsEnabled={!isLoadError && captionsEnabled}
                    />
                )}
            </>
        </Suspense>
    );
}