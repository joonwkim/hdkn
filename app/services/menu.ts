'use server'
import prisma from "@/prisma/prisma";
import { TreeNode } from "../types/treeMenu";

export async function getTreeNodes() {
    try {
        const treeNodes = await prisma.treeNode.findMany({
            where: {
                parent: null,
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
            // Revalidate every 10 seconds
            revalidate: 10,
        };
    } catch (error) {
        return ({ error });
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
    } catch (error) {
        console.log(error)
    }
}


export async function updateExpandStatus(node: TreeNode) {
    try {
        const result = await prisma.treeNode.update({
            where: {
                id: node.id,
            },
            data: {
                expanded: !node.expanded
            }
        })

        return result;
    } catch (error) {
        console.log(error)
    }
}
