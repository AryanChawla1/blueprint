export type NodeType = 'page' | 'component' | 'unknown';

export type Node = {
    type: NodeType;
    name: string;
    path: string;
    children: Node[];
};

export interface Config {
    framework: string;
    exclude: string[];
    entry: string;
    diagram: {
        colors: {
            page: string;
            component: string;
            unknown: string;
            [key: string]: string; // Allow additional colors
        }
    }
}