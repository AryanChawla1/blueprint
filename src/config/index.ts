import fs from 'fs';
import path from 'path';

import { Config } from '../types';

export function loadConfig(root: string): Config {
    const configPath = path.join(root, 'blueprint.config.json');
    if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(raw) as Config;
    }
    console.warn("No blueprint.config.json found, using default configuration.");
    return (
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
    )
}