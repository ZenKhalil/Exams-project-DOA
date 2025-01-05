document.addEventListener("DOMContentLoaded", () => {
  // Initialize core objects
  const visualizer = new SortingVisualizer(); // UI visualization
  const sorter = new CountingSort(); // Implements sorting algorithm
  const buffer = new CircularBuffer(10); // Stores recent sorting steps

  let numbers = []; // Array of numbers to sort
  let currentStep = 0; // Current step in the sorting process

  // UI elements
  const elements = {
    nextStep: document.getElementById("nextStep"),
    startSort: document.getElementById("startSort"),
    addNumber: document.getElementById("addNumber"),
    randomize: document.getElementById("randomize"),
    speedControl: document.getElementById("speedControl"),
    reset: document.getElementById("reset"),
    stepHistory: document.getElementById("step-history"),
  };

  // Update button states based on sorting progress
  const updateButtonStates = (
    sortingStarted = false,
    sortingComplete = false
  ) => {
    elements.nextStep.disabled = !sortingStarted || sortingComplete;
    elements.startSort.disabled = sortingStarted && !sortingComplete;
    elements.addNumber.disabled = elements.randomize.disabled = sortingStarted;
  };

  // Add new numbers to the array and visualize
  const addNumbersToArray = (count = 1) => {
    const newNumbers = Array.from({ length: count }, () =>
      Math.floor(Math.random() * 20)
    );
    numbers = count === 1 ? [...numbers, ...newNumbers] : newNumbers;
    visualizer.showArray("original-array", numbers);
    visualizer.showArray(
      "sorted-array",
      new Array(numbers.length),
      [],
      -1,
      true
    );
  };

  // Update the step history display
  const updateHistoryDisplay = () => {
    elements.stepHistory.innerHTML = "<h3>Last Steps:</h3>";
    buffer.getLast().forEach((step) => {
      if (step.data.type === "counting_iteration" && !step.isFirstScan) return;

      const element = document.createElement("div");
      element.className = `history-step${
        step.step === currentStep - 1 ? " active" : ""
      }`;
      element.textContent = step.data.description;
      element.addEventListener("click", () => jumpToStep(step.step));
      elements.stepHistory.appendChild(element);
    });
  };

  // Visualize a single sorting step
  const handleStepVisualization = async (
    step,
    stepIndex,
    discoveredIndices
  ) => {
    const highlightIndex = numbers.indexOf(step.activeNumber ?? step.number);

    if (highlightIndex !== -1) {
      await visualizer.showArray(
        "original-array",
        numbers,
        [highlightIndex],
        highlightIndex
      );
    }

    switch (step.type) {
      case "counting_iteration":
      case "counting":
        await visualizer.showArray(
          "count-array",
          step.data,
          discoveredIndices,
          step.currentIndex
        );
        break;

      case "cumulative":
        await visualizer.showArray(
          "count-array",
          step.data,
          discoveredIndices,
          step.currentIndex
        );
        break;

      case "position_lookup":
      case "position_calculation":
        await visualizer.showArray(
          "count-array",
          step.data.countArray,
          [step.countIndex],
          step.countIndex
        );
        await visualizer.showArray(
          "sorted-array",
          step.data.sortedArray,
          step.type === "position_calculation" ? [step.targetPosition] : [],
          step.targetPosition,
          false
        );
        break;

      case "sorting":
        await visualizer.showArray(
          "count-array",
          step.data.countArray,
          discoveredIndices
        );
        await visualizer.showArray(
          "sorted-array",
          step.data.sortedArray,
          [],
          step.targetPosition,
          false
        );
        break;

      default:
        await visualizer.showArray("original-array", numbers);
    }

    // Add relevant steps to the buffer for history
    const shouldAddToBuffer =
      step.type !== "counting_iteration" ||
      !sorter.getSteps()[stepIndex - 1] ||
      sorter.getSteps()[stepIndex - 1].activeNumber !== step.activeNumber;

    if (shouldAddToBuffer) {
      buffer.add({ step: stepIndex, data: step });
      updateHistoryDisplay();
    }
  };

  // Jump to a specific step in the process
  const jumpToStep = async (targetStep) => {
    if (targetStep > currentStep && currentStep < sorter.getSteps().length) {
      await handleStepVisualization(
        sorter.getSteps()[currentStep],
        currentStep,
        getDiscoveredIndices(currentStep)
      );
      currentStep++;
      updateHistoryDisplay();
      return;
    }

    if (targetStep < currentStep) {
      visualizer.clear();
      visualizer.showArray("original-array", numbers);
      visualizer.showArray(
        "sorted-array",
        new Array(numbers.length),
        [],
        -1,
        true
      );

      for (let i = 0; i <= targetStep; i++) {
        await handleStepVisualization(
          sorter.getSteps()[i],
          i,
          getDiscoveredIndices(i)
        );
      }
      currentStep = targetStep + 1;
      updateHistoryDisplay();
    }
  };

  // Get all discovered indices up to a specific step
  const getDiscoveredIndices = (upToIndex) =>
    sorter
      .getSteps()
      .slice(0, upToIndex + 1)
      .filter((s) => s.type === "counting" && s.currentIndex !== undefined)
      .map((s) => s.currentIndex);

  // Execute all steps matching a specific type
  const executeNextSteps = async (validateStepType) => {
    const steps = sorter.getSteps();
    while (currentStep < steps.length && validateStepType(steps[currentStep])) {
      await handleStepVisualization(
        steps[currentStep],
        currentStep,
        getDiscoveredIndices(currentStep)
      );
      currentStep++;
    }
  };

  // Event listeners for buttons
  elements.addNumber.addEventListener("click", () => addNumbersToArray(1));
  elements.randomize.addEventListener("click", () => addNumbersToArray(8));

  elements.startSort.addEventListener("click", () => {
    if (numbers.length > 0) {
      sorter.sortPlatforms(numbers);
      currentStep = 0;
      visualizer.showArray(
        "sorted-array",
        new Array(numbers.length),
        [],
        -1,
        true
      );
      updateButtonStates(true, false);
    }
  });

  elements.nextStep.addEventListener("click", async () => {
    const steps = sorter.getSteps();
    if (currentStep >= steps.length) {
      buffer.add({
        step: currentStep,
        data: { description: "Sorting completed!", type: "completion" },
      });
      updateHistoryDisplay();
      updateButtonStates(true, true);
      return;
    }

    const nextStep = steps[currentStep];
    if (nextStep.type === "counting_iteration") {
      const targetNumber = nextStep.activeNumber;
      await executeNextSteps(
        (step) =>
          step.type === "counting_iteration" &&
          step.activeNumber === targetNumber
      );

      if (
        currentStep < steps.length &&
        steps[currentStep].type === "counting"
      ) {
        await handleStepVisualization(
          steps[currentStep],
          currentStep,
          getDiscoveredIndices(currentStep)
        );
        currentStep++;
      }
    } else if (nextStep.type === "cumulative") {
      await executeNextSteps((step) => step.type === "cumulative");
    } else {
      await handleStepVisualization(
        nextStep,
        currentStep,
        getDiscoveredIndices(currentStep)
      );
      currentStep++;
    }

    if (currentStep >= steps.length) {
      buffer.add({
        step: currentStep,
        data: { description: "Sorting completed!", type: "completion" },
      });
      updateHistoryDisplay();
      updateButtonStates(true, true);
    }
  });

  elements.reset.addEventListener("click", () => {
    // Reset all states
    numbers = [];
    currentStep = 0;
    sorter.resetSteps();
    visualizer.clear();
    buffer.clear();
    elements.stepHistory.innerHTML = "<h3>Last Steps:</h3>";
    updateButtonStates(false, false);
  });

  elements.speedControl.addEventListener("input", (e) =>
    visualizer.setAnimationSpeed(1100 - parseInt(e.target.value))
  );

  // Initialize button states
  updateButtonStates(false, false);
});
