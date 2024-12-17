'use client'
import React, { useEffect, useState } from 'react';
import { TreeNode } from '../../types/treeMenu';
import './styles.css'
import { useRouter } from 'next/navigation';
import { setNodeSelectedAction, updateExpandStatusAction } from '@/app/actions/menu';

interface TreeViewProps {
    nodes?: TreeNode[];
    theme: 'light' | 'dark' | 'auto'
}

async function getTreeNodes(): Promise<TreeNode[]> {
    const res = await fetch('/api/treeData/')
    return res.json();
}

const TreeView: React.FC<TreeViewProps> = ({ nodes, theme }) => {
    const [treeData, setTreeData] = useState<TreeNode[]>(nodes ? nodes : []);
    const [showMenu, setShowMenu] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [currentNode, setCurrentNode] = useState<TreeNode | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetch = async () => {
            const data = await getTreeNodes();
            setTreeData(data);
            //console.log('treeData: ', data)
        }
        fetch();
    }, [])

    const toggleNode = (id: string, nodeList: TreeNode[]): TreeNode[] => {
        return nodeList.map(node => {
            if (node.id === id) {
                return { ...node, expanded: !node.expanded };
            } else if (node.children) {
                return { ...node, children: toggleNode(id, node.children) };
            }
            return node;
        });
    };

    const handleToggle = async (node: TreeNode) => {
        await updateExpandStatusAction(node);
        const updatedTree = toggleNode(node.id, treeData);
        setTreeData(updatedTree);
    };

    const handleNodeClick = async (node: TreeNode) => {
        await setNodeSelectedAction(node.id);
        const data = await getTreeNodes();
        setTreeData(data);
        if (node.url) {
            router.push(node.url);
        }        
    };

    const openDialog = (node: TreeNode) => {
        setCurrentNode(node);
        setShowDialog(true);
    };

    const addNode = (newNode: Omit<TreeNode, 'id'>) => {
        setTreeData(prevState => [
            ...prevState,
            {
                ...newNode,
                id: Math.random().toString(),
            },
        ]);
        setShowDialog(false);
    };

    const handleCancel = () => {
        setShowDialog(false);
    }

    const renderTreeNodes = (nodeList: TreeNode[], level = 0) => {
        return (
            <ul className={`list-unstyled indent-${level}`}>
                {nodeList.length > 0 && nodeList.map(node => (
                    <li key={node.id} className={`${node.selected ? theme === 'dark' ? 'selectedLeafNodeDark' : 'selectedLeafNodeLight' : ''}`}>
                        <div className='d-flex align-items-center justify-content-between nodeItem' onMouseEnter={() => setShowMenu(node.id)} onMouseLeave={() => setShowMenu(null)}                        >
                            <div className="d-flex align-items-center" onClick={() => handleNodeClick(node)}>
                                {/* Node Name and Icon */}
                                <i className={`bi ${node.icon} me-2`} />
                                <span>{node.name}</span>
                            </div>

                            {/* Chevron for expanding/collapsing at the end */}
                            <div className="d-flex align-items-center">
                                {node.children && node.children.length > 0 && (
                                    <i
                                        className={`bi ${node.expanded ? 'bi-chevron-down' : 'bi-chevron-right'} chevron`}
                                        onClick={() => handleToggle(node)}
                                    />
                                )}

                                {/* Three dots button for nodes without children */}
                                {!node.children?.length && showMenu === node.id && (
                                    <div data-bs-toggle="dropdown">
                                        <i className="bi bi-three-dots" >
                                        </i>
                                        <ul className="dropdown-menu">
                                            <li className="dropdown-item" onClick={() => openDialog(currentNode!)}>Add Sibling Node</li>
                                            <li className="dropdown-item" onClick={() => openDialog(currentNode!)}>Add Child Node</li>
                                            <li className="dropdown-item" onClick={() => openDialog(currentNode!)}>Delete Node</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recursively render children */}
                        {node.expanded && node.children &&
                            renderTreeNodes(node.children, level + 1)
                        }
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div>
            {renderTreeNodes(treeData)}
            {/* Dialog for adding node */}
            {showDialog && (
                <div className='dialog'>
                    <div className="modal-dialog-centered border border-primary bg bg-white">
                        <div className='p-5'>
                            <h5>Add New Node</h5>
                            <form>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input type="text" className="form-control mb-2" placeholder="Enter node name" />
                                </div>
                                <div className="form-group">
                                    <label>Icon</label>
                                    <input type="text" className="form-control mb-2" placeholder="Bootstrap icon class" />
                                </div>
                                <div className="form-group">
                                    <label>URL</label>
                                    <input type="text" className="form-control mb-2" placeholder="Enter URL" />
                                </div>
                                <div className='d-flex justify-content-between mt-2'>
                                    <button type="button" className="btn btn-primary" onClick={() => addNode(currentNode!)}>
                                        Add
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => handleCancel()}>
                                        Cancle
                                    </button>
                                </div>

                            </form>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default TreeView;
