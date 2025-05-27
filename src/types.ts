export type Node = {
    type: 'page' | 'component';
    name: string;
    children: Node[];
};

export interface Config {
    framework: string;
    exclude: string[];
    diagram: {
        colors: {
            page: string;
            component: string;
            [key: string]: string; // Allow additional colors
        }
    }
}