'use client'
import React, { createContext, Dispatch, useCallback, useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { actionName, DropdownItem, getRichTextAction, RichTextAction, ToolbarItem } from '../data/toolbarData';
import Toolbar from '../../controls/toolbar';
import { $createParagraphNode, $getRoot, $getSelection, $insertNodes, $isRangeSelection, $isRootOrShadowRoot, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_CRITICAL, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_NORMAL, createCommand, EditorThemeClasses, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, INDENT_CONTENT_COMMAND, KEY_MODIFIER_COMMAND, Klass, LexicalCommand, LexicalEditor, LexicalNode, OUTDENT_CONTENT_COMMAND, REDO_COMMAND, SELECTION_CHANGE_COMMAND, UNDO_COMMAND } from 'lexical';
import { $findMatchingParent, $isEditorIsNestedEditor, $getNearestNodeOfType, mergeRegister, $wrapNodeInElement, } from '@lexical/utils'
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text';
import { $isListNode, INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListNode, } from '@lexical/list';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { getSelectedNode, } from '../utils/getSelectedNode';
// import { sanitizeUrl } from '../utils/url';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $createImageNode, ImageNode, ImagePayload } from '../nodes/ImageNode';
import { sanitizeUrl } from '../utils/url';
import { $createTableNodeWithDimensions, INSERT_TABLE_COMMAND, InsertTableCommandPayload, TableNode } from '@lexical/table';
import { INSERT_LAYOUT_COMMAND } from './LayoutPlugin';
import { $createStickyNode } from '../nodes/StickyNode';
import { INSERT_YOUTUBE_COMMAND } from './YouTubePlugin';
import { consoleLogFormData, } from '@/app/lib/formData';
// import { ImageNodeBlobData, } from '@/app/lib/types';

export type InsertImagePayload = Readonly<ImagePayload>;
export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand('INSERT_IMAGE_COMMAND');

export const INSERT_NEW_TABLE_COMMAND: LexicalCommand<InsertTableCommandPayload> = createCommand('INSERT_NEW_TABLE_COMMAND');


export type CellEditorConfig = Readonly<{ namespace: string; nodes?: ReadonlyArray<Klass<LexicalNode>>; onError: (error: Error, editor: LexicalEditor) => void; readOnly?: boolean; theme?: EditorThemeClasses; }>;

export type CellContextShape = {
    cellEditorConfig: null | CellEditorConfig;
    cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
    set: (cellEditorConfig: null | CellEditorConfig, cellEditorPlugins: null | JSX.Element | Array<JSX.Element>,) => void;
};

export const CellContext = createContext<CellContextShape>({
    cellEditorConfig: null,
    cellEditorPlugins: null,
    set: () => {
        // Empty
    },
});

interface LexicalToolbarProps {
    isReadOnly: boolean,
    lexicalToolbarData: ToolbarItem[],
    setIsLinkEditMode: Dispatch<boolean>,
    saveDocument: (content: string, imageFormData: FormData[]) => void
}

//#endregion

const ToolbarPlugin = ({ lexicalToolbarData, isReadOnly, setIsLinkEditMode, saveDocument }: LexicalToolbarProps) => {
    const [editor] = useLexicalComposerContext();
    const [toolbarData, setToolbarData] = useState<ToolbarItem[]>(lexicalToolbarData)
    const [activeEditor, setActiveEditor] = useState(editor);
    const [imageFormData, setImageFormData] = useState<FormData[]>([])
    // const [blockType, setBlockType] = useState<keyof typeof actionName>(RichTextAction.Paragraph);
    // const [isRTL, setIsRTL] = useState(false);
    // const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null,);
    // const [selectedRichTextAction, setSelectedRichTextAction] = useState<RichTextAction | null>(null)
    // const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');
    // const [isEditable, setIsEditable] = useState(() => editor.isEditable());
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [selectedBlockType, setSelectedBlockType] = useState<DropdownItem | undefined>()
    // const cellContext = useContext(CellContext);
    // const cellContext = useContext(CellContext);


    const $updateDropdownItemForBlockFormatItmes = useCallback((action: RichTextAction) => {
        const updatedToolbarData = toolbarData.map(item => ({ ...item, dropdownItems: item.dropdownItems?.map(dropdown => dropdown.id === action ? { ...dropdown, active: true } : { ...dropdown, active: false }) }));
        const si = updatedToolbarData[4].dropdownItems?.find(item => item.id === action);
        if (si) {
            setSelectedBlockType(si)
        }
    }, [toolbarData]);

    const $upDataLinkButton = useCallback((value: boolean) => {
        const updatedToolbarData = toolbarData.map((item: ToolbarItem) => item.id === RichTextAction.Link ? { ...item, active: value } : item);
        if (updatedToolbarData) {
            setToolbarData(updatedToolbarData);
        }
    }, [toolbarData])

    //updateToolbar
    const $updateToolbar = useCallback(() => {

        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
                // const rootElement = activeEditor.getRootElement();
                // setIsImageCaption(!!rootElement?.parentElement?.classList.contains('image-caption-container',),);
            } else {
                // setIsImageCaption(false);
            }
            const anchorNode = selection.anchor.getNode();
            let element = anchorNode.getKey() === 'root' ? anchorNode : $findMatchingParent(anchorNode, (e) => { const parent = e.getParent(); return parent !== null && $isRootOrShadowRoot(parent); });
            if (element === null) {
                element = anchorNode.getTopLevelElementOrThrow();
            }

            const elementKey = element.getKey();
            const elementDOM = activeEditor.getElementByKey(elementKey);
            // setIsRTL($isParentElementRTL(selection));

            // Update links
            const node = getSelectedNode(selection);
            const parent = node.getParent();

            if ($isLinkNode(parent) || $isLinkNode(node)) {
                setIsLink(true);
            } else {
                setIsLink(false);

            }
            $upDataLinkButton(isLink);
            if (elementDOM !== null) {
                // setSelectedElementKey(elementKey);
                let type;
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode,);
                    type = parentList ? parentList.getListType() : element.getListType();
                    // setBlockType(type as keyof typeof actionName);
                } else {
                    type = $isHeadingNode(element) ? element.getTag() : element.getType();
                    if (type in actionName) {
                        // setBlockType(type as keyof typeof actionName);
                    }

                }
                const action = getRichTextAction(type)

                if (action) {
                    // setSelectedRichTextAction(action)
                    $updateDropdownItemForBlockFormatItmes(action);

                }
            }
            // let matchingParent;
            // if ($isLinkNode(parent)) {
            //     matchingParent = $findMatchingParent(node, (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),);
            // }

            // If matchingParent is a valid node, pass it's format type
            // setElementFormat($isElementNode(matchingParent) ? matchingParent.getFormatType() : $isElementNode(node) ? node.getFormatType() : parent?.getFormatType() || 'left',);
        }
    }, [$upDataLinkButton, $updateDropdownItemForBlockFormatItmes, activeEditor, editor, isLink]);

    // editor.setEditable(!isReadOnly); /
    useEffect(() => {
        editor.setEditable(!isReadOnly); // Set editor to editable when not in read-only mode
    }, [editor, isReadOnly]);


    //set toolbar  data
    useEffect(() => {
        setToolbarData(lexicalToolbarData)
    }, [lexicalToolbarData])

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error('ImagesPlugin: ImageNode not registered on editor');
        }
        return mergeRegister(
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, newEditor) => {
                    setActiveEditor(newEditor);
                    $updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),

            activeEditor.registerCommand<InsertImagePayload>(
                INSERT_IMAGE_COMMAND,
                (payload) => {
                    const imageNode = $createImageNode(payload);
                    $insertNodes([imageNode]);
                    if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
                        $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
                    }
                    return true;
                }, COMMAND_PRIORITY_EDITOR,),
            // activeEditor.registerEditableListener((editable) => {
            //     setIsEditable(editable);
            // }),
            activeEditor.registerCommand<boolean>(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            activeEditor.registerCommand<boolean>(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),

        );
    }, [$updateToolbar, activeEditor, editor]);

    //to get updated content
    useEffect(() => {
        return activeEditor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                $updateToolbar();
            });
        });
    }, [$updateToolbar, activeEditor]);

    useEffect(() => {
        return activeEditor.registerCommand(
            KEY_MODIFIER_COMMAND,
            (payload) => {
                const event: KeyboardEvent = payload;
                const { code, ctrlKey, metaKey } = event;

                if (code === 'KeyK' && (ctrlKey || metaKey)) {
                    event.preventDefault();
                    let url: string | null;
                    if (!isLink) {
                        setIsLinkEditMode(true);
                        url = sanitizeUrl('https://');
                    } else {
                        setIsLinkEditMode(false);
                        url = null;
                    }
                    return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
                }
                return false;
            },
            COMMAND_PRIORITY_NORMAL,
        );
    }, [activeEditor, isLink, setIsLinkEditMode]);

    useEffect(() => {
        if (!activeEditor.hasNodes([TableNode])) {
            // invariant(false, 'TablePlugin: TableNode is not registered on editor');
        }

        // cellContext.set(cellEditorConfig, children);

        return activeEditor.registerCommand<InsertTableCommandPayload>(
            INSERT_NEW_TABLE_COMMAND,
            ({ columns, rows, includeHeaders }) => {
                const tableNode = $createTableNodeWithDimensions(
                    Number(rows),
                    Number(columns),
                    includeHeaders,
                );
                $insertNodes([tableNode]);
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [activeEditor]);

    // async function saveLexicalFile(editor) {
    //     try {
    //         const file = await exportFile(editor, { fileName: 'myDocument.lexical' });

    //         if (!(file instanceof Blob)) {
    //             throw new Error('Exported file is not a valid Blob');
    //         }

    //         const fileContent = await file.text(); // Get the file content as text
    //         console.log('Exported file content:', fileContent);
    //         return fileContent; // Use this to save or process
    //     } catch (error) {
    //         console.error('Error exporting file:', error);
    //     }
    // }

    const handleToolbarSelect = async (item: ToolbarItem) => {
        switch (item.id) {
            case RichTextAction.Undo: {
                const td = toolbarData.map(item =>
                    item.id === RichTextAction.Undo ? { ...item, disabled: false } : item
                );
                setToolbarData(td);
                activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
                break;
            }
            case RichTextAction.Redo: {
                activeEditor.dispatchCommand(REDO_COMMAND, undefined);
                break;
            }
            case RichTextAction.Bold: {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
                break;
            }
            case RichTextAction.Italics: {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
                break;
            }
            case RichTextAction.Underline: {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
                break;
            }
            case RichTextAction.Strikethrough: {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
                break;
            }
            case RichTextAction.Link: {
                if (!isLink) {
                    setIsLinkEditMode(true);
                    activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'),);
                } else {
                    setIsLinkEditMode(false);
                    activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                }
                break;
            }

            case RichTextAction.Paragraph: {
                activeEditor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $setBlocksType(selection, () => $createParagraphNode());
                    }
                });
                break;
            }
            case RichTextAction.H1: {
                activeEditor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $setBlocksType(selection, () => $createHeadingNode(RichTextAction.H1));
                    }
                });
                break;
            }
            case RichTextAction.H2: {
                activeEditor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $setBlocksType(selection, () => $createHeadingNode(RichTextAction.H2));
                    }
                });

                break;
            }
            case RichTextAction.H3: {
                activeEditor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $setBlocksType(selection, () => $createHeadingNode(RichTextAction.H3));
                    }
                });
                break;
            }
            case RichTextAction.Bullet: {
                activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                break;
            }
            case RichTextAction.Number: {
                activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                break;
            }
            case RichTextAction.Check: {
                activeEditor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
                break;
            }
            case RichTextAction.Quote: {
                activeEditor.update(() => {
                    const selection = $getSelection();
                    $setBlocksType(selection, () => $createQuoteNode());
                });
                break;
            }
            case RichTextAction.HR: {
                activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
                break;
            }

            case RichTextAction.CenterAlign: {
                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
                break;
            }
            case RichTextAction.RightAlign: {
                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
                break;
            }
            case RichTextAction.JustifyAlign: {
                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
                break;
            }
            case RichTextAction.Indent: {
                activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
                break;
            }
            case RichTextAction.Outdent: {
                activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
                break;
            }
            case RichTextAction.Sticky: {
                activeEditor.update(() => {
                    const root = $getRoot();
                    const stickyNode = $createStickyNode(0, 0);
                    root.append(stickyNode);
                });
                break;
            }
            case RichTextAction.Save: {
                try {      
                    // const imageNodes = searchImageNodeBlobData(activeEditor);
                    // console.log('imageNodes: ', imageNodes)


                    activeEditor.update(async () => {
                        const editorState = activeEditor.getEditorState();

                        const serializedState = JSON.stringify(editorState);
                        // const root = $getRoot();
                        // const images: { src: string; name: string }[] = [];

                        // root.getChildren().forEach((node) => {
                        //     if (node instanceof ImageNode) {
                        //         console.log('image:', { src: node.getSrc(), name: node.getAltText() || "Untitled" });
                        //         images.push({ src: node.getSrc(), name: node.getAltText() || "Untitled" })
                        //     }
                        // });

                        // console.log('images: ', images)

                        // const blobUrls = getBlobUrls(editorState);
                        // console.log('blobUrls: ', blobUrls)

                        // const imageData: Buffer[] = await fetchBlobData(blobUrls);
                        // console.log('buffer imageData:', imageData)

                        saveDocument(serializedState, imageFormData);
                        // console.log('serializedState:', serializedState)
                    });

                } catch (error) {
                    console.error('Error saving document:', error);
                }
                break;
            }
        }
    }

    const handleInsertImage = (payload: InsertImagePayload) => {
        // console.log('handleInsertImage payload: ', payload)
        const { imageFormData } = payload;
        if (imageFormData) {
            // const formDataObj = Object.fromEntries(imageFormData.entries());
            // const filea = formDataObj['file'] as File;
            // console.log('File name:', filea.name);
            // console.log('Object.fromEntries(imageFormData.entries())', JSON.stringify(formDataObj, null, 2));
            setImageFormData(prev => [...prev, imageFormData])
            // consoleLogFormData('handleInsertImage imageFormData:', imageFormData);
        }
        activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    };
    // const handleInsertInlineImage = (payload: InlineImagePayload) => {
    //     // alert(JSON.stringify(payload))
    //     activeEditor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, payload);
    // };

    const handleInsertTable = (payload: InsertTableCommandPayload) => {

        // activeEditor.update(() => {
        //     const tableNode = $createTableNodeWithDimensions(Number(payload.rows), Number(payload.columns), true);
        //     $insertNodeToNearestRoot(tableNode);
        // });
        activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, payload);
    };
    const handleInsertColumnsLayout = (payload: { value: string }) => {
        // alert(payload.value)
        // activeEditor.update(() => {
        //     const tableNode = $createTableNodeWithDimensions(Number(payload.rows), Number(payload.columns), true);
        //     $insertNodeToNearestRoot(tableNode);
        // });
        activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, payload.value);
    };
    const handleEmbedYoutube = (payload: { value: string }) => {
        activeEditor.dispatchCommand(INSERT_YOUTUBE_COMMAND, payload.value);
    };
    return (
        <div>
            <Toolbar toolbarData={toolbarData} canUndo={canUndo} canRedo={canRedo}
                handleToolbarSelect={handleToolbarSelect} selectedItem={selectedBlockType}
                handleInsertImage={handleInsertImage} handleInsertTable={handleInsertTable}
                handleInsertColumnsLayout={handleInsertColumnsLayout}
                handleEmbedYoutube={handleEmbedYoutube}
            />
        </div>

    )
}

export default ToolbarPlugin
