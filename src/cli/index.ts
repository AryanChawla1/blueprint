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

const entry = path.join(rootPath, config.entry);

try {
    const parsed = parse(framework, entry);
    console.log("Parsed Frontend...");
    if (!parsed) {
        console.error("No valid frontend structure found.");
        process.exit(1);
    }
    const diagram = generateDiagram(parsed, config);
    console.log("Generated Diagram...");
    console.log(diagram);
} catch (error) {
    console.error("Error during parsing or diagram generation:", error);
    process.exit(1);
}
