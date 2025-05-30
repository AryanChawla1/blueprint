
import {Node, Frameworks} from '../types';
import {parse as parseViteReactJS} from './vite-react-js';

export function parse(framework: Frameworks, entry: string): Node | null{
    switch (framework) {
        case 'vite-react-js':
            return parseViteReactJS(entry);
        default:
            throw new Error(`Unsupported framework: ${framework}`);
    }
}
