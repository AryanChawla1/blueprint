import fs from 'fs';
import path from 'path';

import { Config } from '../types';

export function loadConfig(root: string): Config {
    const configPath = path.join(root, 'blueprint.config.json');
    if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(raw) as Config;
    }
    return (
        {
            "framework": "vite-react",
            "exclude": [
                "node_modules",
                "dist",
                "build"
            ],
            "diagram": {
                "colors": {
                    "page": "#FF5733",
                    "component": "#33FF57"
                }
            }
        }
    )
}