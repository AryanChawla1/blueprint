export type NodeType = 'page' | 'component' | 'unknown';

export type Node = {
    type: NodeType;
    name: string;
    path: string;
    children: Node[];
    routes?: Node[];
    links?: Node[];
};

export interface PositionedNode extends Node {
    x: number;
    y: number;
}

export interface Config {
    framework: Frameworks;
    exclude: string[];
    entry: string;
    diagram: {
        colors: {
            page: string;
            component: string;
            unknown: string;
            routes: string;
            links: string;
            [key: string]: string; // Allow additional colors
        }
    }
}

export type Frameworks = 'vite-react-js' | 'unknown';
