import chalk from 'chalk';

import { Node } from '../types';
import { Config } from '../types';

export function generateDiagram(data: Node, config: Config, indent = '   ', isLast = true): string {
    const getColorFn = (name: string) => {
        const color = config?.diagram?.colors?.[name];
        if (!color) return (text: string) => text;

        if (color.startsWith('#')) {
            return chalk.hex(color);
        }
        return (chalk as any)[color] || ((text: string) => text);
    };

    const branch = isLast ? '└─ ' : '├─ ';
    const nextIndent = indent + (isLast ? '   ' : '│  ');

    const colorize = getColorFn(data.type || data.name); // use `type` if you have one
    const result = `${indent}${branch}${colorize(data.name)}\n`;

    const lastIndex = data.children.length - 1;
    return result + data.children.map((child, index) => generateDiagram(child, config, nextIndent, index === lastIndex)).join('');
}
