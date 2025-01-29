import { $getNodeByKey, $getSelection, $isNodeSelection, $isRangeSelection, $setSelection, BaseSelection, CLICK_COMMAND, COMMAND_PRIORITY_LOW, createCommand, DRAGSTART_COMMAND, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, LexicalCommand, LexicalEditor, LineBreakNode, NodeKey, ParagraphNode, RootNode, SELECTION_CHANGE_COMMAND, TextNode } from 'lexical';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { $isImageNode } from './ImageNode';
import { mergeRegister } from '@lexical/utils';
// import { useSettings } from '../context/SettingsContext';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import ImageResizer from './ImageResizer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
// import TreeViewPlugin from '../plugins/TreeViewPlugin';
import { LinkNode } from '@lexical/link';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { useSharedHistoryContext } from '../context/SharedHistoryContext';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { KeywordNode } from './KeywordNode';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import './styles.css'
import Image from 'next/image'
import { Position } from './InlineImageNode';

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> = createCommand('RIGHT_CLICK_IMAGE_COMMAND');
interface LazyImageProps {
    altText: string;
    className: string;
    imageRef: { current: null | HTMLImageElement };
    width?: number;
    height?: number;
    maxWidth?: number;
    src: string;
    onError: () => void;
}

function LazyImage({ altText, className, imageRef, width, height, src, onError }: LazyImageProps): JSX.Element {
    useEffect(() => {

        const root = document.documentElement;
        if (root) {
            if (width && !height) {
                root.style.setProperty('--image-auto-width', width.toString() + 'px');
            } else if (height && !width) {
                root.style.setProperty('--image-auto-height', height.toString() + 'px');
            }

        }
    }, [height, width])

    return (<>
        <div>{src}</div>
        {width && height && (<>


            <Image
                className={className}
                alt={altText}
                src={src}
                width={width}
                height={height}
                ref={imageRef}
                draggable="false"
                onError={onError}
            /></>)}

        {width && !height && (<>
            {/* <div>case2</div> */}
            {/* <div>{`width: ${width}`}</div>
            <div>{`height: ${height}`}</div> */}
            <div className='image-width'>
                <Image
                    className='image-auto-remove'
                    src={src}
                    alt={altText}
                    fill
                    ref={imageRef}
                    draggable="false"
                    onError={onError}
                />
            </div>
        </>)}
        {!width && height && (<>
            {/* <div>case3</div> */}
            {/* <div>{`width: ${width}`}</div>
            <div>{`height: ${height}`}</div> */}
            <div className='image-height'>
                <Image
                    className='image-auto-override'
                    src={src}
                    alt={altText}
                    fill
                    ref={imageRef}
                    draggable="false"
                    onError={onError}
                />
            </div>
        </>)}

        {!width && !height && (<>
            {/* <div>case4</div> */}
            <Image
                className={className}
                alt={altText}
                src={src}
                fill
                ref={imageRef}
                draggable="false"
                onError={onError}
            />
        </>)}
    </>
    );
}

interface ImageComponentProps {
    altText: string;
    caption: LexicalEditor;
    width?: number;
    height?: number;
    maxWidth?: number;
    nodeKey: NodeKey;
    resizable: boolean;
    showCaption: boolean;
    src: string;
    captionsEnabled: boolean;
    position: Position;
}


const ImageComponent = ({ src, altText, nodeKey, width, height, maxWidth, resizable, showCaption, caption, captionsEnabled }: ImageComponentProps) => {

    const imageRef = useRef<null | HTMLImageElement>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const [isResizing, setIsResizing] = useState<boolean>(false);
    const [editor] = useLexicalComposerContext();
    const [selection, setSelection] = useState<BaseSelection | null>(null);
    const activeEditorRef = useRef<LexicalEditor | null>(null);
    const [isLoadError, setIsLoadError] = useState<boolean>(false);

    const $onDelete = useCallback(
        (payload: KeyboardEvent) => {
            const deleteSelection = $getSelection();
            if (isSelected && $isNodeSelection(deleteSelection)) {
                const event: KeyboardEvent = payload;
                event.preventDefault();
                editor.update(() => {
                    deleteSelection.getNodes().forEach((node) => {
                        if ($isImageNode(node)) {
                            node.remove();
                        }
                    });
                });
            }
            return false;
        },
        [editor, isSelected],
    );

    const $onEnter = useCallback(
        (event: KeyboardEvent) => {
            const latestSelection = $getSelection();
            const buttonElem = buttonRef.current;
            if (isSelected && $isNodeSelection(latestSelection) && latestSelection.getNodes().length === 1) {
                if (showCaption) {
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

    const $onEscape = useCallback(
        (event: KeyboardEvent) => {
            if (
                activeEditorRef.current === caption ||
                buttonRef.current === event.target
            ) {
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

    const onRightClick = useCallback(
        (event: MouseEvent): void => {
            editor.getEditorState().read(() => {
                const latestSelection = $getSelection();
                const domElement = event.target as HTMLElement;
                if (
                    domElement.tagName === 'IMG' &&
                    $isRangeSelection(latestSelection) &&
                    latestSelection.getNodes().length === 1
                ) {
                    editor.dispatchCommand(RIGHT_CLICK_IMAGE_COMMAND, event as MouseEvent,);
                }
            });
        },
        [editor],
    );

    useEffect(() => {
        let isMounted = true;
        const rootElement = editor.getRootElement();
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
                onClick,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand<MouseEvent>(
                RIGHT_CLICK_IMAGE_COMMAND,
                onClick,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                DRAGSTART_COMMAND,
                (event) => {
                    if (event.target === imageRef.current) {
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

        rootElement?.addEventListener('contextmenu', onRightClick);

        return () => {
            isMounted = false;
            unregister();
            rootElement?.removeEventListener('contextmenu', onRightClick);
        };
    }, [
        clearSelection,
        editor,
        isResizing,
        isSelected,
        nodeKey,
        $onDelete,
        $onEnter,
        $onEscape,
        onClick,
        onRightClick,
        setSelected,
    ]);

    const setShowCaption = () => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageNode(node)) {
                node.setShowCaption(true);
            }
        });
    };

    const onResizeEnd = (nextWidth: number, nextHeight: number,) => {
        // Delay hiding the resize bars for click case
        setTimeout(() => {
            setIsResizing(false);
        }, 200);

        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageNode(node)) {
                console.log('nextWidth, nextHeight:', nextWidth, nextHeight)
                // node.setWidthAndHeight(nextWidth, nextHeight);
            }
        });
    };

    const onResizeStart = () => {
        setIsResizing(true);
    };

    const { historyState } = useSharedHistoryContext();
    // const { settings: { showNestedEditorTreeView }, } = useSettings();

    const draggable = isSelected && $isNodeSelection(selection) && !isResizing;
    const isFocused = isSelected || isResizing;

    return (
        <Suspense fallback={null}>
            <>
                {/* <div>{`showCaption: ${showCaption}`}</div> */}

                <div className='image-container' draggable={draggable}>
                    {isLoadError ? (
                        <div>
                            <div>{src}</div>
                            <h2 className='text-center'>이미지가 손상되었습니다.</h2></div>

                    ) : (<>
                        <LazyImage
                                className={isFocused ? `image-container focused ${$isNodeSelection(selection) ? 'draggable' : ''}` : 'image-container'}
                            src={src}
                            altText={altText}
                                imageRef={imageRef}
                                width={width}
                                height={height}
                            maxWidth={maxWidth}
                                onError={() => setIsLoadError(true)}
                        />
                        </>
                    )}
                </div>
                {showCaption && (
                    <div className="image-caption-container">
                        <LexicalNestedComposer
                            initialEditor={caption}
                            initialNodes={[
                                RootNode,
                                TextNode,
                                LineBreakNode,
                                ParagraphNode,
                                LinkNode,
                                KeywordNode,
                            ]}>
                            <AutoFocusPlugin />
                            <HistoryPlugin externalHistoryState={historyState} />
                            <RichTextPlugin contentEditable={
                                <ContentEditable
                                    className="image-capton-content-input"
                                    aria-placeholder='Enter a caption'
                                    placeholder={<div className="editor-placeholder">이미지 캡션을 입력하세요.</div>}
                                />
                            }
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            {/* {showNestedEditorTreeView === true ? <TreeViewPlugin /> : null} */}
                        </LexicalNestedComposer>
                    </div>
                )}

                {resizable && $isNodeSelection(selection) && isFocused && (
                    <ImageResizer
                        showCaption={showCaption}
                        setShowCaption={setShowCaption}
                        editor={editor}
                        buttonRef={buttonRef}
                        imageRef={imageRef}
                        maxWidth={maxWidth}
                        onResizeStart={onResizeStart}
                        onResizeEnd={onResizeEnd}
                        captionsEnabled={!isLoadError && captionsEnabled}
                    />
                )}
            </>
        </Suspense>
    )
}
export default ImageComponent