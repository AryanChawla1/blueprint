import fs from 'fs';
import path from 'path';

import {Node} from '../types';
import {parse as parseViteReactJS} from './vite-react-js';

export function detectFramework(rootPath: string): string {
    const files = fs.readdirSync(rootPath);
    if (files.includes('vite.config.js') || files.includes('vite.config.ts')) {
        return 'vite-react';
    }
    return 'unknown';
}

export function parse(framework: string, entry: string): Node | null{
    switch (framework) {
        case 'vite-react-js':
            return parseViteReactJS(entry);
        default:
            throw new Error(`Unsupported framework: ${framework}`);
    }
}