class CountingSort {
  constructor() {
    this.sortingSteps = [];
  }

  sortPlatforms(numbers) {
    // Reset sorting steps for a new sort
    this.sortingSteps = [];

    // Find min, max, and range of numbers
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const range = max - min + 1;

    // Initialize count array with zeros
    const count = new Array(range).fill(0);

    // Count occurrences of each number
    for (let i = 0; i < numbers.length; i++) {
      const num = numbers[i];
      const targetIndex = num - min;

      // Log scanning through the count array
      for (let j = 0; j <= targetIndex; j++) {
        this.sortingSteps.push({
          type: "counting_iteration",
          description: `Scanning through count array for number ${num}`,
          data: [...count],
          activeNumber: num,
          currentIndex: j,
          isTarget: j === targetIndex,
        });
      }

      // Increment count for the target index
      count[targetIndex]++;
      this.sortingSteps.push({
        type: "counting",
        description: `Adding 1 to count[${num}]`,
        data: [...count],
        activeNumber: num,
        currentIndex: targetIndex,
      });
    }

    // Calculate cumulative counts
    for (let i = 1; i < count.length; i++) {
      const oldValue = count[i];
      count[i] += count[i - 1];
      this.sortingSteps.push({
        type: "cumulative",
        description: `Adding previous count (${count[i - 1]}) to position ${i}`,
        data: [...count],
        currentIndex: i,
        previousValue: oldValue,
        newValue: count[i],
      });
    }

    // Build the sorted output array
    const output = new Array(numbers.length);

    // Place numbers in the output array using cumulative counts
    for (let i = numbers.length - 1; i >= 0; i--) {
      const currentNum = numbers[i];
      const countIndex = currentNum - min;

      // Log position lookup
      this.sortingSteps.push({
        type: "position_lookup",
        description: `Finding count array position for ${currentNum} (number - ${min} = ${countIndex})`,
        data: {
          countArray: [...count],
          sortedArray: [...output],
        },
        number: currentNum,
        countIndex: countIndex,
        highlightCount: true,
      });

      // Log position calculation
      this.sortingSteps.push({
        type: "position_calculation",
        description: `Count[${countIndex}] = ${
          count[countIndex]
        }, so ${currentNum} goes to position ${count[countIndex] - 1}`,
        data: {
          countArray: [...count],
          sortedArray: [...output],
        },
        number: currentNum,
        countIndex: countIndex,
        countValue: count[countIndex],
        targetPosition: count[countIndex] - 1,
      });

      // Place the number and decrement its count
      const position = count[countIndex] - 1;
      output[position] = currentNum;
      count[countIndex]--;
      this.sortingSteps.push({
        type: "sorting",
        description: `Placing ${currentNum} in position ${position} and decreasing count[${countIndex}]`,
        data: {
          countArray: [...count],
          sortedArray: [...output],
        },
        currentNumber: currentNum,
        targetPosition: position,
        countIndex: countIndex,
      });
    }

    // Return the sorted array
    return output;
  }

  // Get all recorded sorting steps
  getSteps() {
    return this.sortingSteps;
  }

  // Reset sorting steps
  resetSteps() {
    this.sortingSteps = [];
  }
}
