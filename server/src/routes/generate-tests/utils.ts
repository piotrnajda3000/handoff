export const returnOnlyChangesToFile = (
  originalFile: string,
  changedFile: string
): string[] => {
  const originalLines = originalFile.split("\n");
  const changedLines = changedFile.split("\n");
  const changes: string[] = [];
  for (let i = 0; i < originalLines.length; i++) {
    if (originalLines[i] !== changedLines[i]) {
      changes.push(changedLines[i]);
    }
  }
  return changes.filter(Boolean);
};

export const filterComments = (l: string) =>
  !l.startsWith("\n") && l.startsWith("#");
