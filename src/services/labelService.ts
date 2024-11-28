export const labelService = {
  // Get unique labels from test cases and suites
  getUniqueLabels(items: { labels: string[] }[] = []): string[] {
    if (!items || !Array.isArray(items)) return [];
    const allLabels = items.flatMap(item => item.labels || []);
    return [...new Set(allLabels)].sort();
  },

  // Filter items by labels
  filterByLabels<T extends { labels: string[] }>(
    items: T[],
    selectedLabels: string[]
  ): T[] {
    if (!items || selectedLabels.length === 0) return items;
    return items.filter(item =>
      selectedLabels.some(label => item.labels.includes(label))
    );
  },
};