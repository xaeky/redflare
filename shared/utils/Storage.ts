
const contentTypeDisplayMap: Record<string, string> = {
  'unitypackage': 'Unity Package',
  'zip': 'ZIP Archive',
  'rar': 'RAR Archive',
  '7z': '7-Zip Archive',
  'fbx': 'FBX Model',
  'spp': 'Substance Painter File',
  'blend': 'Blender File',
}

export const getContentTypeByExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return contentTypeDisplayMap[extension] || 'Unknown File Type';
}