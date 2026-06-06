export const toggleCatalogIdInList = (
  currentIds: string[],
  id: string,
  checked: boolean,
): string[] => {
  if (checked) {
    if (currentIds.includes(id)) {
      return currentIds;
    }
    return [...currentIds, id];
  }
  return currentIds.filter((currentId) => currentId !== id);
};
