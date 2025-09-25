export const MOCK_EXAMPLE_FILE = `
interface Point {
    x: number;
    y: number;
}

function dragNode(startPos: Point, currentPos: Point) {
    const delta = {
    x: currentPos.x - startPos.x,
    y: currentPos.y - startPos.y
    };
    return delta;
}`.trim();
