import { Node } from "../types"

export function parse(): Node {
    return (
        {
            "type": "page",
            "name": "App",
            "children": [
                {
                    "type": "page",
                    "name": "Home",
                    "children": []
                }
            ]
        }
    )
}