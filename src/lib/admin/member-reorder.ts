export function buildMemberReorderUpdates(sectionId: string, orderedPersonIds: string[]) {
  return orderedPersonIds.map((personId, index) => ({
    personId,
    sectionId,
    sortOrder: index + 1,
  }));
}
