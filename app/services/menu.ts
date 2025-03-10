'use server'
import prisma from "@/prisma/prisma";
import { TreeNode } from "../types/treeMenu";

export async function getTreeNodes() {
    try {
        const treeNodes = await prisma.treeNode.findMany({
            where: {
                parent: null,
                active: true,
            },
            include: {
                parent: true,
                children: {
                    orderBy: {
                        orderBy: 'asc'
                    }
                }
            },
            orderBy: {
                orderBy: 'asc'
            }
        });

        return {
            props: {
                treeNodes,
            },
            revalidate: 10, // Ensure this is outside `props`
        };
    } catch (error) {
        return {
            props: {
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        };
    }
}

export async function setNodeSelected(nodeId: string) {
    try {

        await prisma.treeNode.updateMany({
            where: {
                selected: true,
            },
            data: {
                selected: false,
            }
        })
        if (nodeId) {
            const node = await prisma.treeNode.update({
                where: {
                    id: nodeId,
                    children: {
                        none: {},
                    }
                },
                data: {
                    selected: true,
                }
            })
            return node;
        }       
    } catch (error) {
        console.log(error)
    }
}

export async function updateExpandStatus(node: TreeNode) {
    try {
        const collapsAll = await prisma.treeNode.updateMany({
            data: {
                expanded: false,
            }
        })
        // console.log('collapsAll: ', collapsAll)
        if (node) {
            const result = await prisma.treeNode.update({
                where: {
                    id: node.id,
                },
                data: {
                    expanded: !node.expanded
                }
            })
            return result;
        }

    } catch (error) {
        console.log(error)
    }
}
