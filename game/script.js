document.addEventListener("DOMContentLoaded", () => {
  // Initialize core objects
  const cityTheme = new CityTheme();
  const cityBuilder = new CityBuilder(cityTheme);
  const visualizer = new SortingVisualizer();
  const sorter = new CountingSort();
  const buffer = new CircularBuffer(10);

  let numbers = [];
  let currentStep = 0;
  let sortingSteps = [];
  let sortingComplete = false;
  let isDarkMode = false;

  const elements = {
    nextStep: document.getElementById("nextStep"),
    startSort: document.getElementById("startSort"),
    addNumber: document.getElementById("addNumber"),
    randomize: document.getElementById("randomize"),
    speedControl: document.getElementById("speedControl"),
    reset: document.getElementById("reset"),
    stepHistory: document.getElementById("step-history"),
    darkModeToggle: document.getElementById("darkModeToggle"),
  };

  const findCorrectIndex = (array, targetNumber, step) => {
    // For steps that don't need an originalIndex (like cumulative steps), return -1
    if (step.type === "cumulative") {
      return -1;
    }

    // For other steps, use originalIndex if available
    if (step.originalIndex !== undefined) {
      return step.originalIndex;
    }

    // Fallback for other cases
    return array.indexOf(targetNumber);
  };

  const updateLabels = () => {
    elements.addNumber.textContent = "Add Building";
    elements.randomize.textContent = "Generate City Block";
    elements.startSort.textContent = "Organize City";
    elements.nextStep.textContent = "Next Phase";
    elements.reset.textContent = "Clear City";
    document.querySelector(".speed-control label").textContent =
      "Construction Speed:";
  };

  const toggleDarkMode = () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle("dark-mode");
    elements.darkModeToggle.textContent = isDarkMode
      ? "Light Mode"
      : "Dark Mode";
    visualizer.updateTheme?.(isDarkMode);
  };

  const updateButtonStates = (sortingStarted = false, isComplete = false) => {
    elements.nextStep.disabled = !sortingStarted || isComplete;
    elements.startSort.disabled = sortingStarted && !isComplete;
    elements.addNumber.disabled = elements.randomize.disabled = sortingStarted;
  };

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
    updateButtonStates(false, false);
  };

  const handleStepVisualization = async (
    step,
    stepIndex,
    discoveredIndices
  ) => {
    if (step.type === "counting_iteration") {
      const steps = sortingSteps;
      const currentNumber = step.activeNumber;
      let currentIdx = stepIndex;

      // Process all steps for the current number
      while (
        currentIdx < steps.length &&
        steps[currentIdx].type === "counting_iteration" &&
        steps[currentIdx].activeNumber === currentNumber
      ) {
        const currentStep = steps[currentIdx];
        // Use the step directly to maintain sequence
        const highlightIndex = findCorrectIndex(
          numbers,
          currentNumber,
          currentStep
        );

        await visualizer.showArray(
          "original-array",
          numbers,
          [highlightIndex],
          highlightIndex
        );

        await visualizer.showArray(
          "count-array",
          currentStep.data,
          discoveredIndices,
          currentStep.currentIndex
        );

        if (currentStep.isFirstScan) {
          buffer.add({ step: currentIdx, data: currentStep });
          updateHistoryDisplay();
        }

        currentIdx++;
      }

      // Handle subsequent counting step
      if (currentIdx < steps.length && steps[currentIdx].type === "counting") {
        const countStep = steps[currentIdx];
        await visualizer.showArray(
          "count-array",
          countStep.data,
          discoveredIndices,
          countStep.currentIndex
        );
        buffer.add({ step: currentIdx, data: countStep });
        updateHistoryDisplay();
        currentIdx++;
      }

      return currentIdx;
    }

    // Handle other step types
    if (step.type !== "cumulative") {
      const targetNumber = step.activeNumber ?? step.number;
      const highlightIndex = findCorrectIndex(numbers, targetNumber, step);

      if (highlightIndex !== -1) {
        await visualizer.showArray(
          "original-array",
          numbers,
          [highlightIndex],
          highlightIndex
        );
      }
    }

    switch (step.type) {
      case "counting":
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
    }

    buffer.add({ step: stepIndex, data: step });
    updateHistoryDisplay();
    return stepIndex + 1;
  };

  const showNextStep = async () => {
    if (currentStep >= sortingSteps.length) {
      sortingComplete = true;
      buffer.add({
        step: currentStep,
        data: { description: "Sorting completed!", type: "completion" },
      });
      updateHistoryDisplay();
      updateButtonStates(true, true);
      return;
    }

    const step = sortingSteps[currentStep];
    const discoveredIndices = getDiscoveredIndices(currentStep);
    currentStep = await handleStepVisualization(
      step,
      currentStep,
      discoveredIndices
    );

    if (currentStep >= sortingSteps.length) {
      buffer.add({
        step: currentStep,
        data: { description: "Sorting completed!", type: "completion" },
      });
      updateHistoryDisplay();
      updateButtonStates(true, true);
    }
  };

  const getDiscoveredIndices = (stepIndex) => {
    return sorter
      .getSteps()
      .slice(0, stepIndex + 1)
      .filter((s) => s.type === "counting" && s.currentIndex !== undefined)
      .map((s) => s.currentIndex);
  };

  const convertToConstructionStep = (description) => {
    const conversions = {
      Counting: "Surveying district",
      "Calculating position": "Planning building placement",
      "Moving element": "Relocating building",
      "Sorting completed!": "City construction completed! 🏗️",
    };

    for (const [key, value] of Object.entries(conversions)) {
      if (description.includes(key)) {
        return description.replace(key, value);
      }
    }
    return description;
  };

  const updateHistoryDisplay = () => {
    elements.stepHistory.innerHTML = "<h3>Construction Log:</h3>";
    buffer.getLast().forEach((step) => {
      const element = document.createElement("div");
      element.className = `history-step${
        step.step === currentStep - 1 ? " active" : ""
      }`;
      element.textContent = convertToConstructionStep(step.data.description);
      element.addEventListener("click", () => jumpToStep(step.step));
      elements.stepHistory.appendChild(element);
    });
  };

  const jumpToStep = async (targetStep) => {
    if (targetStep < 0 || targetStep >= sortingSteps.length) return;

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
      const step = sortingSteps[i];
      const discoveredIndices = getDiscoveredIndices(i);
      await handleStepVisualization(step, i, discoveredIndices);
    }

    currentStep = targetStep + 1;
    updateButtonStates(true, currentStep >= sortingSteps.length);
  };

  const startSorting = () => {
    if (numbers.length === 0) return;
    currentStep = 0;
    buffer.clear();
    sortingComplete = false;
    sorter.sortPlatforms(numbers);
    sortingSteps = sorter.getSteps();
    updateButtonStates(true, false);
    showNextStep();
  };

  const resetVisualization = () => {
    numbers = [];
    currentStep = 0;
    sortingSteps = [];
    sortingComplete = false;
    buffer.clear();
    visualizer.clear();
    elements.stepHistory.innerHTML = "<h3>Construction Log:</h3>";
    updateButtonStates(false, false);
  };

  // Initialize UI and event listeners
  const initializeUI = () => {
    elements.addNumber.addEventListener("click", () => addNumbersToArray(1));
    elements.randomize.addEventListener("click", () => addNumbersToArray(8));
    elements.startSort.addEventListener("click", startSorting);
    elements.nextStep.addEventListener("click", showNextStep);
    elements.reset.addEventListener("click", resetVisualization);
    elements.darkModeToggle?.addEventListener("click", toggleDarkMode);
    elements.speedControl.addEventListener("input", (e) =>
      visualizer.setAnimationSpeed(1100 - parseInt(e.target.value))
    );

    updateLabels();
    updateButtonStates();

    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      toggleDarkMode();
    }
  };

  initializeUI();
});
