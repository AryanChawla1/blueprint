import chalk from 'chalk';

import { Node } from '../types';
import { Config } from '../types';

export function generateDiagram(data: Node, config: Config, indent = '   '): string {
    const getColorFn = (name: string) => {
        const color = config?.diagram?.colors?.[name];
        if (!color) return (text: string) => text;

        // Chalk supports colors by name: "red", "blue", etc.
        // For hex codes, use chalk.hex()
        if (color.startsWith('#')) {
            return chalk.hex(color);
        }
        return (chalk as any)[color] || ((text: string) => text);
    };

    const colorize = getColorFn(data.type || data.name); // use `type` if you have one
    const result = `${indent}${colorize(data.name)}\n`;

    return result + data.children.map(child => generateDiagram(child, config, indent + '  ')).join('');
}
