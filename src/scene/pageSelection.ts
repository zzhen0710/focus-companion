export function selectedPage(index: number, count: number) { return Math.min(Math.max(0, index), Math.max(0, count - 1)) }
