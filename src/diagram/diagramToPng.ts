import { createCanvas } from "canvas";

import { PositionedNode, Node, Config } from "../types";

const NODE_WIDTH = 120;
const NODE_HEIGHT = 40;
const HORIZONTAL_SPACING = 30;
const VERTICAL_SPACING = 70;

//TODO: Add support for custom colors and styles from config
//TODO: Adjust canas size based on tree depth and width
//TODO: Rather than building a tree left to right, start from the center and build outwards

// function to get the dimensions of the tree for canvas size
function getDimensions(root: Node):
    { width: number; height: number } {
    let maxWidth = 0;
    let maxHeight = 0;

    function traverse(node: Node, depth: number, xOffset: number): number {
        const currentWidth = NODE_WIDTH + HORIZONTAL_SPACING;
        const currentHeight = NODE_HEIGHT + VERTICAL_SPACING;

        maxHeight = Math.max(maxHeight, (depth + 1) * currentHeight);

        let nextX = xOffset;
        for (const child of node.children) {
            nextX = traverse(child, depth + 1, nextX);
            nextX += NODE_WIDTH + HORIZONTAL_SPACING;
        }

        maxWidth = Math.max(maxWidth, xOffset + NODE_WIDTH);

        return xOffset;
    }

    traverse(root, 0, 50);
    return { width: maxWidth + HORIZONTAL_SPACING, height: maxHeight };
}

export async function renderTreeToPNG(root: Node, outputPath: string, config: Config) {
    const {width, height} = getDimensions(root);
    console.log(`Canvas size: ${width}x${height}`);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const positioned: PositionedNode[] = [];
    let maxDepth = 0;
    
    function layoutTree(node: Node, depth: number, xOffset: number): number {
        const current: PositionedNode = {
            ...node,
            x: xOffset,
            y: depth * (NODE_HEIGHT + VERTICAL_SPACING),
        };
        positioned.push(current);
        maxDepth = Math.max(maxDepth, depth);

        let nextX = xOffset;

        for (const child of node.children) {
            nextX = layoutTree(child, depth + 1, nextX);
            nextX += NODE_WIDTH + HORIZONTAL_SPACING;
        }

        return current.x;
    }

    layoutTree(root, 0, 50);

    positioned.forEach((parent) => {
        parent.children.forEach((child) => {
            const childNode = positioned.find(n => n.name === child.name);
            if (childNode) {
                ctx.beginPath();
                ctx.moveTo(parent.x + NODE_WIDTH / 2, parent.y + NODE_HEIGHT);
                ctx.lineTo(childNode.x + NODE_WIDTH / 2, childNode.y);
                ctx.stroke();
            }
        });
    });

    ctx.font = "12pz sans-serif";
    ctx.textAlign = "center";
    positioned.forEach((node) => {
        const type = config.diagram.colors[node.type] || "#eee";
        ctx.fillStyle = type;
        ctx.fillRect(node.x, node.y, NODE_WIDTH, NODE_HEIGHT);
        ctx.fillStyle = "#000";
        ctx.fillText(node.name, node.x + NODE_WIDTH / 2, node.y + NODE_HEIGHT / 2 + 5);
    })

    const buffer = canvas.toBuffer("image/png");
    require("fs").writeFileSync(outputPath, buffer);
}