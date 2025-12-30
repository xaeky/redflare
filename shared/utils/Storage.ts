
const contentTypeDisplayMap: Record<string, string> = {
  'unitypackage': 'Unity Package',
  'zip': 'ZIP Archive',
  'rar': 'RAR Archive',
  '7z': '7-Zip Archive',
  'fbx': 'FBX Model',
  'spp': 'Substance Painter File',
  'blend': 'Blender File',
}

export const getAllowedAttachmentExtensions = (): string[] => {
  return Object.keys(contentTypeDisplayMap);
}

export const getContentTypeByExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return contentTypeDisplayMap[extension] || 'Unknown File Type';
}

export const formatFileSize = (sizeInBytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = sizeInBytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${unitIndex === 0 ? size : size.toFixed(2)} ${units[unitIndex]}`;
}