import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getTableColumnIndexFromTableCellNode,
    $getTableRowIndexFromTableCellNode,
    $insertTableColumn__EXPERIMENTAL,
    $insertTableRow__EXPERIMENTAL,
    $isTableCellNode,
    $isTableNode,
    TableCellNode,
    TableNode,
    TableRowNode,
} from '@lexical/table';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { $getNearestNodeFromDOMNode, NodeKey } from 'lexical';
import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { useDebounce } from './CodeActionMenuPlugin/utils';
import StyledAddColumnButton from '../styledComponents/StyledAddColumnButton';

const BUTTON_WIDTH_PX = 20;

export interface PositionProps {
    height: number;
    top: number;
    left: number;
    width: number;
}

function TableHoverActionsContainer({ anchorElem, }: { anchorElem: HTMLElement; }): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [isShownRow, setShownRow] = useState<boolean>(false);
    const [isShownColumn, setShownColumn] = useState<boolean>(false);
    const [shouldListenMouseMove, setShouldListenMouseMove] = useState<boolean>(false);
    const [position, setPosition] = useState<PositionProps>({ height: 177.3, top: 157, left: 603, width: 20 });
    const codeSetRef = useRef<Set<NodeKey>>(new Set());
    const tableDOMNodeRef = useRef<HTMLElement | null>(null);

    const debouncedOnMouseMove = useDebounce((event: MouseEvent) => {
        const { isOutside, tableDOMNode } = getMouseInfo(event);

        if (isOutside) {
            setShownRow(false);
            setShownColumn(false);
            return;
        }

        if (!tableDOMNode) {
            return;
        }

        tableDOMNodeRef.current = tableDOMNode;

        let hoveredRowNode: TableCellNode | null = null;
        let hoveredColumnNode: TableCellNode | null = null;
        let tableDOMElement: HTMLElement | null = null;

        editor.update(() => {
            const maybeTableCell = $getNearestNodeFromDOMNode(tableDOMNode);

            if ($isTableCellNode(maybeTableCell)) {
                const table = $findMatchingParent(maybeTableCell, (node) =>
                    $isTableNode(node),
                );
                if (!$isTableNode(table)) {
                    return;
                }

                tableDOMElement = editor.getElementByKey(table?.getKey());

                if (tableDOMElement) {
                    const rowCount = table.getChildrenSize();
                    const colCount = (
                        (table as TableNode).getChildAtIndex(0) as TableRowNode
                    )?.getChildrenSize();

                    const rowIndex = $getTableRowIndexFromTableCellNode(maybeTableCell);
                    const colIndex = $getTableColumnIndexFromTableCellNode(maybeTableCell);

                    if (rowIndex === rowCount - 1) {
                        hoveredRowNode = maybeTableCell;
                    } else if (colIndex === colCount - 1) {
                        hoveredColumnNode = maybeTableCell;
                    }
                }
            }
        });

        if (tableDOMElement) {
            const { width: tableElemWidth, y: tableElemY, x: tableElemX, right: tableElemRight, bottom: tableElemBottom, height: tableElemHeight, } = (tableDOMElement as HTMLTableElement).getBoundingClientRect();

            const { y: editorElemY } = anchorElem.getBoundingClientRect();

            if (hoveredRowNode) {
                setShownColumn(false);
                setShownRow(true);
                setPosition({ height: BUTTON_WIDTH_PX, left: tableElemX, top: tableElemBottom - editorElemY + 5, width: tableElemWidth, });
            } else if (hoveredColumnNode) {
                setShownColumn(true);
                setShownRow(false);
                setPosition({ height: tableElemHeight, left: tableElemRight + 5, top: tableElemY - editorElemY, width: BUTTON_WIDTH_PX, });
            }
        }
    },
        50,
        250,
    );

    useEffect(() => {
        if (!shouldListenMouseMove) {
            return;
        }

        document.addEventListener('mousemove', debouncedOnMouseMove);

        return () => {
            setShownRow(false);
            setShownColumn(false);
            debouncedOnMouseMove.cancel();
            document.removeEventListener('mousemove', debouncedOnMouseMove);
        };
    }, [shouldListenMouseMove, debouncedOnMouseMove]);

    useEffect(() => {
        return mergeRegister(
            editor.registerMutationListener(
                TableNode,
                (mutations) => {
                    editor.getEditorState().read(() => {
                        mutations.forEach((mutation, nodeKey) => {
                            if (mutation === 'created') {
                                codeSetRef.current.add(nodeKey);
                                setShouldListenMouseMove(codeSetRef.current.size > 0);
                                // Additional logic when a tableNode is created
                            } else if (mutation === 'updated') {
                                // Additional logic when a tableNode is updated
                            } else if (mutation === 'destroyed') {
                                console.log(`mutaion destroyed TableNode with key ${nodeKey} was removed`);
                                codeSetRef.current.delete(nodeKey);
                                setShouldListenMouseMove(codeSetRef.current.size > 0);
                                // Additional logic when a tableNode is deleted
                            }
                        });
                    });
                },
                { skipInitialization: false },
            ),
        );
    }, [editor]);

    const insertAction = (insertRow: boolean) => {
        editor.update(() => {
            if (tableDOMNodeRef.current) {
                const maybeTableNode = $getNearestNodeFromDOMNode(
                    tableDOMNodeRef.current,
                );
                maybeTableNode?.selectEnd();
                if (insertRow) {
                    $insertTableRow__EXPERIMENTAL();
                    setShownRow(false);
                } else {
                    $insertTableColumn__EXPERIMENTAL();
                    setShownColumn(false);
                }
            }
        });
    };
    return (
        <>
            {isShownRow && (
                <StyledAddColumnButton
                    className='editor-tableAddColumns'
                    title="tableAddColumns"
                    onClick={() => insertAction(true)}
                    height={position.height}
                    top={position.top}
                    left={position.left}
                    width={position.width}
                />
            )}
            {isShownColumn && (
                <StyledAddColumnButton
                    title="tableAddColumns"
                    className='editor-tableAddColumns'
                    onClick={() => insertAction(false)}
                    height={position.height}
                    top={position.top}
                    left={position.left}
                    width={position.width}
                />
            )}
        </>
    );
}

function getMouseInfo(event: MouseEvent): { tableDOMNode: HTMLElement | null; isOutside: boolean; } {
    const target = event.target;

    if (target && target instanceof HTMLElement) {
        const tableDOMNode = target.closest<HTMLElement>(
            'td.editor-tableCell, th.editor-tableCell',
        );

        const isOutside = !(tableDOMNode || target.closest<HTMLElement>('button.editor__tableAddRows',) || target.closest<HTMLElement>('button.editor-tableAddColumns',) || target.closest<HTMLElement>('div.editor-table-resizer'));

        return { isOutside, tableDOMNode };
    } else {
        return { isOutside: true, tableDOMNode: null };
    }
}

export default function TableHoverActionsPlugin({ anchorElem }: { anchorElem?: HTMLElement }): React.ReactPortal | null {
    const [isClient, setIsClient] = useState(false);
    React.useLayoutEffect(() => {
        setIsClient(true);
    }, []);
    if (!isClient) return null;

    return createPortal(<TableHoverActionsContainer anchorElem={anchorElem ?? document.body} />, anchorElem ?? document.body);
}