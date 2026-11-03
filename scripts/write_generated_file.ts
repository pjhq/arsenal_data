function withoutUpdatedDate(content: string): string {
  return content.replace(/^("(?:Type: [^\r\n]* \| )?Last Updated: )\d{4}-\d{2}-\d{2}(";)/, "$1$2");
}

export async function writeGeneratedFile(filePath: string, content: string): Promise<boolean> {
  const file = Bun.file(filePath);
  if ((await file.exists()) && withoutUpdatedDate(await file.text()) === withoutUpdatedDate(content)) {
    return false;
  }

  await Bun.write(filePath, content);
  return true;
}