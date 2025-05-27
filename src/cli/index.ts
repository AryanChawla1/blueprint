#!/usr/bin/env node
import path from 'path';

import {loadConfig} from '../config';
import {detectFramework, parse} from '../parsers';
import {generateDiagram} from '../diagram/generate';

const rootPath = process.cwd();

const config = loadConfig(rootPath);
console.log("Loaded Config:", config);

const framework = config.framework || detectFramework(rootPath);
console.log("Detected Framework:", framework);

try {
    const parsed = parse(framework, rootPath);
    console.log("Parsed Frontend...");
    const diagram = generateDiagram(parsed, config);
    console.log("Generated Diagram...");
    console.log(diagram);
} catch (error) {
    console.error("Error during parsing or diagram generation:", error);
    process.exit(1);
}
