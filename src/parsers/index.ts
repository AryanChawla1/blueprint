import fs from 'fs';
import path from 'path';

import {Node} from '../types';
import {parse as parseViteReact} from './vite-react';

export function detectFramework(rootPath: string): string {
    const files = fs.readdirSync(rootPath);
    if (files.includes('vite.config.js') || files.includes('vite.config.ts')) {
        return 'vite-react';
    }
    return 'unknown';
}

export function parse(framework: string, rootPath: string): Node {
    switch (framework) {
        case 'vite-react':
            return parseViteReact();
        default:
            throw new Error(`Unsupported framework: ${framework}`);
    }
}