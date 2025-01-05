class CountingSort {
  constructor() {
    this.sortingSteps = [];
  }

  sortPlatforms(numbers) {
    this.sortingSteps = [];

    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const range = max - min + 1;
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
          originalIndex: i, // Add original index
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
        originalIndex: i, // Add original index
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

    // Create array to track which indices we've processed for each number
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
        originalIndex: i, // Add original index
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
        originalIndex: i, // Add original index
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
        originalIndex: i, // Add original index
      });
    }

    return output;
  }

  getSteps() {
    return this.sortingSteps;
  }

  resetSteps() {
    this.sortingSteps = [];
  }
}
 