'use client'
//#region import export interface
import React, { createContext, Dispatch, useCallback, useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DropdownItem, getRichTextAction, RichTextAction, ToolbarItem } from '../data/toolbarData';
import Toolbar from '../../controls/toolbar';
import { $createParagraphNode, $getRoot, $getSelection, $insertNodes, $isRangeSelection, $isRootOrShadowRoot, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_CRITICAL, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_NORMAL, createCommand, EditorThemeClasses, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, INDENT_CONTENT_COMMAND, KEY_MODIFIER_COMMAND, Klass, LexicalCommand, LexicalEditor, LexicalNode, OUTDENT_CONTENT_COMMAND, REDO_COMMAND, SELECTION_CHANGE_COMMAND, UNDO_COMMAND } from 'lexical';
import { $findMatchingParent, $getNearestNodeOfType, mergeRegister, $wrapNodeInElement, } from '@lexical/utils'
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text';
import { $isListNode, INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListNode, } from '@lexical/list';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { getSelectedNode, } from '../utils/getSelectedNode';
// import { getImageNodes, getSelectedNode, } from '../utils/getSelectedNode';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $createImageNode, ImageNode, ImagePayload, } from '../nodes/ImageNode';
// import { $createImageNode, ImageNode, ImagePayload, ResizedImage } from '../nodes/ImageNode';
import { sanitizeUrl } from '../utils/url';
import { $createTableNodeWithDimensions, INSERT_TABLE_COMMAND, InsertTableCommandPayload } from '@lexical/table';
import { INSERT_LAYOUT_COMMAND } from './LayoutPlugin';
import { $createStickyNode } from '../nodes/StickyNode';
import { INSERT_YOUTUBE_COMMAND } from './YouTubePlugin';
// import { resizeCloudinaryImage } from '@/app/actions/cloudinary';
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
    saveDocument: (content: string) => void
}
//#endregion

const ToolbarPlugin = ({ lexicalToolbarData, isReadOnly, setIsLinkEditMode, saveDocument }: LexicalToolbarProps) => {
    const [editor] = useLexicalComposerContext();
    const [toolbarData, setToolbarData] = useState<ToolbarItem[]>(lexicalToolbarData)
    const [activeEditor, setActiveEditor] = useState(editor);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [selectedBlockType, setSelectedBlockType] = useState<DropdownItem | undefined>()
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
            const anchorNode = selection.anchor.getNode();
            let element = anchorNode.getKey() === 'root' ? anchorNode : $findMatchingParent(anchorNode, (e) => { const parent = e.getParent(); return parent !== null && $isRootOrShadowRoot(parent); });
            if (element === null) {
                element = anchorNode.getTopLevelElementOrThrow();
            }

            const elementKey = element.getKey();
            const elementDOM = activeEditor.getElementByKey(elementKey);
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
                let type;
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode,);
                    type = parentList ? parentList.getListType() : element.getListType();
                } else {
                    type = $isHeadingNode(element) ? element.getTag() : element.getType();
                }
                const action = getRichTextAction(type)
                if (action) {
                    $updateDropdownItemForBlockFormatItmes(action);

                }
            }
        }
    }, [$upDataLinkButton, $updateDropdownItemForBlockFormatItmes, activeEditor, isLink]);

    useEffect(() => {
        editor.setEditable(!isReadOnly); // Set editor to editable when not in read-only mode
    }, [editor, isReadOnly]);

    useEffect(() => {
        setToolbarData(lexicalToolbarData)
    }, [lexicalToolbarData])


    // const updateImage = (resized: ResizedImage) => {
    //     // image를 삽입하고 size를 변경하였을 경우 
    //     // console.log(resized);
    //     // alert(JSON.stringify(resized))
    //     const result = resizeCloudinaryImage(resized);
    //     console.log('result: ', result)
    // }


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

                    // const np: ImagePayload = { ...payload, updateResizedImage: updateImage }
                    // const imageNode = $createImageNode(np);
                    const imageNode = $createImageNode(payload);
                    // console.log('imageNode:', imageNode)
                    $insertNodes([imageNode]);
                    if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
                        $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
                    }
                    return true;
                }, COMMAND_PRIORITY_EDITOR,),
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
                    const updatedState = activeEditor.getEditorState();
                    const serializedState = JSON.stringify(updatedState);
                    // console.log("serializedState:", serializedState);
                    saveDocument(serializedState);
                    // const imageNodes = getImageNodes(activeEditor);
                    // imageNodes.forEach((node) => {
                    //     console.log('node to save: ', node)
                    // });

                } catch (error) {
                    console.error('Error saving document:', error);
                }
                break;
            }
        }
    }

    const handleInsertImage = (payload: InsertImagePayload) => {
        activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    };

    const handleInsertTable = (payload: InsertTableCommandPayload) => {
        activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, payload);
    };
    const handleInsertColumnsLayout = (payload: { value: string }) => {
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
