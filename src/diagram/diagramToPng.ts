import { createCanvas } from "canvas";

import { PositionedNode, Node } from "../types";

const NODE_WIDTH = 120;
const NODE_HEIGHT = 40;
const HORIZONTAL_SPACING = 30;
const VERTICAL_SPACING = 70;

export async function renderTreeToPNG(root: Node, outputPath: string) {
    const canvas = createCanvas(1200, 800); //determine size based on node properties
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
        ctx.fillStyle = "#eee";
        ctx.fillRect(node.x, node.y, NODE_WIDTH, NODE_HEIGHT);
        ctx.fillStyle = "#000";
        ctx.fillText(node.name, node.x + NODE_WIDTH / 2, node.y + NODE_HEIGHT / 2 + 5);
    })

    const buffer = canvas.toBuffer("image/png");
    require("fs").writeFileSync(outputPath, buffer);
}