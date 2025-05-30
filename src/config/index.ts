import fs from 'fs';
import path from 'path';

import { Config, Frameworks } from '../types';

const CONFIG_FILENAME = 'blueprint.config.json';
const defaultConfig_vite_react_js: Config =
{
    "framework": "vite-react-js",
    "exclude": [
        "node_modules",
        "dist",
        "build"
    ],
    "entry": "src/main.jsx",
    "diagram": {
        "colors": {
            "page": "#FF0000",
            "component": "#00FF00",
            "unknown": "#0000FF"
        }
    }
}

export function detectFramework(rootPath: string): Frameworks {
    const files = fs.readdirSync(rootPath);
    if (files.includes('vite.config.js')) {
        return 'vite-react-js';
    }
    return 'unknown';
}

export function loadConfig(root: string): Config {
    const configPath = path.join(root, CONFIG_FILENAME);
    if (fs.existsSync(configPath)) {
        console.log("Found blueprint.config.json, loading configuration...");
        const raw = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(raw) as Config;
    }
    console.warn("No blueprint.config.json found, Detecting framework and creating default config...");
    const framework = detectFramework(root);
    console.log("Detected framework:", framework);
    if (framework === 'vite-react-js') {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig_vite_react_js, null, 2), 'utf-8');
    return defaultConfig_vite_react_js;
    }
    throw new Error("Unsupported framework detected. Please create a blueprint.config.json file manually.");

}
