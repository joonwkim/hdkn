export interface TreeNode {
    id: string;                     // Unique identifier for each node
    name: string;                   // Display name of the node
    icon: string;                   // Bootstrap icon class or any icon reference
    url?: string;                   // Optional navigation URL for the node
    expanded: boolean;              // Status to indicate whether the node is expanded or not
    selected?: boolean;
    order?: number;
    level: number;                  // Recursive level of the node
    children?: TreeNode[];          // Recursive definition for child nodes
}

export type TreeMenu = TreeNode[];
