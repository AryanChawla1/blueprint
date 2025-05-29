import path from "path"
import fs from "fs"
import {parse as bparse} from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

import { Node, NodeType } from "../types"

const cache = new Map<string, Node>();

function classifyType(filePath: string): NodeType {
    if (filePath.includes('/pages/') || filePath.includes('\\pages\\')) return 'page';
    if (filePath.includes('/components/') || filePath.includes('\\components\\')) return 'component';
    return 'unknown';
}

function resolveImportPath(from: string, importPath: string): string {
    const base = path.resolve(path.dirname(from), importPath);
    const extensions = ['', '.js', '.jsx'];
    for (const ext of extensions) {
        const fullPath = `${base}${ext}`;
        if (fs.existsSync(fullPath)) return fullPath;
        const indexPath = path.join(base, `index${ext}`);
        if (fs.existsSync(indexPath)) return indexPath;
    }
    return '';
}

function resolveBarrelPath(base: string, component: string): string {
    const extensions = ["index.js", "index.jsx"]
        for (const ext of extensions) {
            const indexPath = path.join(base, ext);
            if (fs.existsSync(indexPath)) {
                const content = fs.readFileSync(indexPath, 'utf-8');
                const ast = bparse(content, {
                    sourceType: 'module',
                    plugins: ['jsx',]
                });
                let resolvedPath: string | null = null;
                traverse(ast, {
                    ExportNamedDeclaration(bpath) {
                        if (bpath.node.source && Array.isArray(bpath.node.specifiers)) {
                            for (const spec of bpath.node.specifiers) {
                                const exported =
                                    t.isIdentifier(spec.exported) ? spec.exported.name : null;
                                if (exported === component) {
                                    const importSource = bpath.node.source.value;
                                    const newPath = path.join(base, importSource);
                                    const resolved = resolveImportPath(newPath, importSource);
                                    if (resolved) {
                                        resolvedPath = resolved;
                                    }
                                }
                            }
                        }
                    },
                });
                return resolvedPath || indexPath;
            }
        }
    return '';
}


export function parse(filePath: string): Node | null {
    const absolutePath = path.resolve(filePath);
    if (cache.has(absolutePath)) {
        return cache.get(absolutePath)!;
    }
    if (!fs.existsSync(absolutePath)) {
        return null;
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');
    const ast = bparse(content, {
        sourceType: 'module',
        plugins: ['jsx',]
    });
    
    const imports: Record<string, string> = {};
    const components: Set<string> = new Set();

    traverse(ast, {
        ImportDeclaration(path) {
            const source = path.node.source.value;
            if (source.startsWith('.')) {
                for (const spec of path.node.specifiers) {
                    if (t.isImportSpecifier(spec) || t.isImportDefaultSpecifier(spec)) {
                        imports[spec.local.name] = source;
                    }
                }
            }
        },
        JSXOpeningElement(path) {
            if (t.isJSXIdentifier(path.node.name)) {
                const name = path.node.name.name;
                if (/^[A-Z]/.test(name)) {
                    components.add(name);
                }
            }
        }
    });

    const children: Node[] = [];
    let childPath = '';
    for (const name of components) {
        const relImport = imports[name];
        if (!relImport) continue;
        const fullPath = path.join(path.dirname(absolutePath), relImport);
        if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
            childPath = resolveBarrelPath(fullPath, name);
        } else {
            childPath = resolveImportPath(absolutePath, relImport);
        }
        const childNode = parse(childPath);
        if (childNode) {
            children.push(childNode);
        }
    }
    const node: Node =  (
        {
            name: path.basename(filePath),
            path: filePath,
            type: classifyType(filePath),
            children: children
        }
    )
    cache.set(absolutePath, node);
    return node;
}
