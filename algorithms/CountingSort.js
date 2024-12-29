class CountingSort {
  constructor() {
    this.sortingSteps = [];
  }

  sortPlatforms(platforms, key = "w") {
    // Handle empty or single platform 
    if (!platforms || platforms.length <= 1) {
      return platforms || [];
    }

    // Find the range of values from biggest to lowest
    let min = Infinity;
    let max = -Infinity;

    // Get min and max through the range
    for (let platform of platforms) {
      if (platform && platform[key] !== undefined) {
        min = Math.min(min, platform[key]);
        max = Math.max(max, platform[key]);
      }
    }

    // If no valid values found or invalid range
    if (min === Infinity || max === -Infinity || min > max) {
      return platforms;
    }

    const range = max - min + 1;

    // Create counting array with safe length all 0's
    const count = new Array(range).fill(0);

    // Count occurrences
    for (let platform of platforms) {
      if (platform && platform[key] !== undefined) {
        count[platform[key] - min]++;
      }
    }

    // Store counting step
    this.sortingSteps.push({
      type: "counting",
      data: [...count],
    });

    // Calculate cumulative count
    for (let i = 1; i < count.length; i++) {
      count[i] += count[i - 1];
    }

    // Store cumulative step
    this.sortingSteps.push({
      type: "cumulative",
      data: [...count],
    });

    // Build output array
    const output = new Array(platforms.length);
    for (let i = platforms.length - 1; i >= 0; i--) {
      const platform = platforms[i];
      if (platform && platform[key] !== undefined) {
        const index = count[platform[key] - min] - 1;
        output[index] = platform;
        count[platform[key] - min]--;
      }
    }

    // Visualize the sorting process
    if (window.sortingVisualizer) {
      window.sortingVisualizer.clear();
      window.sortingVisualizer.showOriginalPlatforms(platforms);
      window.sortingVisualizer.showCountingArray(count);
      window.sortingVisualizer.showSortedPlatforms(output.filter(Boolean));
    }

    return output.filter(Boolean); 
  }

  // Get all visualization steps
  getSteps() {
    return this.sortingSteps;
  }

  // Reset visualization steps
  resetSteps() {
    this.sortingSteps = [];
  }
}
