'use server'

import { revalidatePath } from "next/cache";
import { setNodeSelected, updateExpandStatus } from "../services/menu";
import { TreeNode } from "../types/treeMenu";

export async function setNodeSelectedAction(nodeId: string) {
    try {
        await setNodeSelected(nodeId);
        revalidatePath('/');
        return true;
    } catch (error) {
        console.log(error)
    }
}
export async function updateExpandStatusAction(node: TreeNode) {
    try {
        await updateExpandStatus(node);
        revalidatePath('/');
        return true;
    } catch (error) {
        console.log(error)
    }
}