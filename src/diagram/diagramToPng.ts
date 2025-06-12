import { createCanvas } from "canvas";
import { PositionedNode, Node, Config } from "../types";
import fs from "fs";

const NODE_WIDTH = 150;
const NODE_HEIGHT = 45;
const HORIZONTAL_SPACING = 30;
const VERTICAL_SPACING = 70;

// --- Helper: Calculate subtree widths ---
function measureWidths(node: Node): number {
    if (node.children.length === 0) {
        (node as any)._subtreeWidth = NODE_WIDTH;
        return NODE_WIDTH;
    }

    let total = 0;
    for (const child of node.children) {
        const w = measureWidths(child);
        total += w + HORIZONTAL_SPACING;
    }
    total -= HORIZONTAL_SPACING; // remove last gap
    (node as any)._subtreeWidth = total;
    return total;
}

// --- Helper: Apply actual layout ---
function applyLayout(
    node: Node,
    depth: number,
    xStart: number,
    positioned: PositionedNode[]
): void {
    const subtreeWidth = (node as any)._subtreeWidth ?? NODE_WIDTH;
    const x = xStart + subtreeWidth / 2 - NODE_WIDTH / 2;
    const y = depth * (NODE_HEIGHT + VERTICAL_SPACING);

    const positionedNode: PositionedNode = {
        ...node,
        x,
        y,
    };
    positioned.push(positionedNode);

    let currentX = xStart;
    for (const child of node.children) {
        const childWidth = (child as any)._subtreeWidth ?? NODE_WIDTH;
        applyLayout(child, depth + 1, currentX, positioned);
        currentX += childWidth + HORIZONTAL_SPACING;
    }
}

// --- Helper: Get Dimensions ---
function getDimensions(root: Node): { width: number; height: number } {
    const width = (root as any)._subtreeWidth ?? NODE_WIDTH;
    const height = getDepth(root) * (NODE_HEIGHT + VERTICAL_SPACING);
    return { width: width + 2 * HORIZONTAL_SPACING, height };
}

function getDepth(node: Node): number {
    if (node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map(getDepth));
}

// --- Main Function ---
export async function renderTreeToPNG(root: Node, outputPath: string, config: Config) {
    measureWidths(root);
    const { width, height } = getDimensions(root);
    console.log(`Canvas size: ${width}x${height}`);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const positioned: PositionedNode[] = [];
    applyLayout(root, 0, HORIZONTAL_SPACING, positioned);

    // Draw edges
    positioned.forEach((parent) => {
        parent.children.forEach((child) => {
            const childNode = positioned.find((n) => n.name === child.name);
            if (childNode) {
                ctx.beginPath();
                ctx.moveTo(parent.x + NODE_WIDTH / 2, parent.y + NODE_HEIGHT);
                ctx.lineTo(childNode.x + NODE_WIDTH / 2, childNode.y);
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    });

    // Draw nodes
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    positioned.forEach((node) => {
        const fillColor = config.diagram.colors[node.type] || "#eee";
        ctx.fillStyle = fillColor;
        ctx.fillRect(node.x, node.y, NODE_WIDTH, NODE_HEIGHT);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(node.x, node.y, NODE_WIDTH, NODE_HEIGHT);
        ctx.fillStyle = "#000";
        ctx.fillText(node.name, node.x + NODE_WIDTH / 2, node.y + NODE_HEIGHT / 2);
    });

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);
}
