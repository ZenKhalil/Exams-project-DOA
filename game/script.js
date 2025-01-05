document.addEventListener("DOMContentLoaded", () => {
  // Initialize core visualization components
  // Setting up all the main tools we'll use to build and visualize the city and sorting
  const cityTheme = new CityTheme();
  const cityBuilder = new CityBuilder(cityTheme);
  const visualizer = new SortingVisualizer();
  const sorter = new CountingSort();
  const buffer = new CircularBuffer(10); // Keeps track of the last 10 steps for history

  // Global state management
  // This 'state' object holds all the important data and references we'll need globally
  const state = {
    numbers: [], // The array of numbers we're sorting
    currentStep: 0, // Tracks which step we're on in the sorting process
    sortingSteps: [], // An array that holds all the steps of the sorting algorithm
    sortingComplete: false, // Flag to check if sorting is done
    isDarkMode: false, // Flag for dark mode
    els: {
      // Storing references to all the important HTML elements
      nextStep: document.getElementById("nextStep"),
      startSort: document.getElementById("startSort"),
      addNumber: document.getElementById("addNumber"),
      randomize: document.getElementById("randomize"),
      speedControl: document.getElementById("speedControl"),
      reset: document.getElementById("reset"),
      stepHistory: document.getElementById("step-history"),
      darkModeToggle: document.getElementById("darkModeToggle"),
    },
  };

  // Main visualization update function - handles all array displays
  // This function updates the visual representation of the arrays based on the current step
  const updateArrays = async (step, stepIndex, discoveredIndices) => {
    // Handle counting iteration steps
    // If the current step is part of the counting phase of Counting Sort
    if (step.type === "counting_iteration") {
      let idx = stepIndex;
      const currentNum = step.activeNumber;

      // Process consecutive counting steps for the same number
      // Keep going through steps as long as we're still counting the same number
      while (
        idx < state.sortingSteps.length &&
        state.sortingSteps[idx].type === "counting_iteration" &&
        state.sortingSteps[idx].activeNumber === currentNum
      ) {
        const curStep = state.sortingSteps[idx];
        const highlightIdx =
          curStep.type === "cumulative"
            ? -1 // If it's a cumulative step, no specific index to highlight
            : curStep.originalIndex ?? state.numbers.indexOf(currentNum); // Otherwise, highlight the original index

        // Show both the original array and the count array with highlights
        await Promise.all([
          visualizer.showArray(
            "original-array",
            state.numbers,
            [highlightIdx],
            highlightIdx
          ),
          visualizer.showArray(
            "count-array",
            curStep.data,
            discoveredIndices,
            curStep.currentIndex
          ),
        ]);

        // If this is the first time we're scanning this step, add it to the buffer and update history
        if (curStep.isFirstScan) {
          buffer.add({ step: idx, data: curStep });
          updateHistory();
        }
        idx++; // Move to the next step
      }

      // Handle final counting step if present
      // After finishing the iterations, there might be a final counting step to process
      if (
        idx < state.sortingSteps.length &&
        state.sortingSteps[idx].type === "counting"
      ) {
        const countStep = state.sortingSteps[idx];
        await visualizer.showArray(
          "count-array",
          countStep.data,
          discoveredIndices,
          countStep.currentIndex
        );
        buffer.add({ step: idx, data: countStep });
        updateHistory();
        idx++;
      }
      return idx; // Return the updated index after processing
    }

    // Handle non-counting iteration steps
    // For steps that aren't part of the counting phase
    const targetNum = step.activeNumber ?? step.number;
    const highlightIdx =
      step.type !== "cumulative"
        ? step.originalIndex ?? state.numbers.indexOf(targetNum)
        : -1; // Determine which index to highlight

    // If there's an index to highlight, show the original array with that highlight
    if (highlightIdx !== -1) {
      await visualizer.showArray(
        "original-array",
        state.numbers,
        [highlightIdx],
        highlightIdx
      );
    }

    // Update visualizations based on step type
    // Depending on what kind of step it is, update the appropriate arrays
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
        await Promise.all([
          visualizer.showArray(
            "count-array",
            step.data.countArray,
            [step.countIndex],
            step.countIndex
          ),
          visualizer.showArray(
            "sorted-array",
            step.data.sortedArray,
            step.type === "position_calculation" ? [step.targetPosition] : [],
            step.targetPosition,
            false
          ),
        ]);
        break;
      case "sorting":
        await Promise.all([
          visualizer.showArray(
            "count-array",
            step.data.countArray,
            discoveredIndices
          ),
          visualizer.showArray(
            "sorted-array",
            step.data.sortedArray,
            [],
            step.targetPosition,
            false
          ),
        ]);
    }

    // Add this step to the buffer and update the history log
    buffer.add({ step: stepIndex, data: step });
    updateHistory();
    return stepIndex + 1; // Move to the next step
  };

  // Jump to specific step in visualization
  // This function allows you to jump back to any step in the sorting process
  const replayToStep = async (targetStep) => {
    // Make sure the target step is within bounds
    if (targetStep < 0 || targetStep >= state.sortingSteps.length) return;

    // Clear the current visualization to start fresh
    visualizer.clear();
    visualizer.showArray("original-array", state.numbers);
    visualizer.showArray(
      "sorted-array",
      new Array(state.numbers.length),
      [],
      -1,
      true
    );

    // Replay all steps up to the target step
    for (let i = 0; i <= targetStep; i++) {
      await updateArrays(
        state.sortingSteps[i],
        i,
        sorter
          .getSteps()
          .slice(0, i + 1)
          .filter((s) => s.type === "counting" && s.currentIndex !== undefined)
          .map((s) => s.currentIndex)
      );
    }

    // Update the current step and button states
    state.currentStep = targetStep + 1;
    updateButtons(true, state.currentStep >= state.sortingSteps.length);
  };

  // Update construction history log
  // This function updates the log that shows all the past steps
  const updateHistory = () => {
    const steps = {
      Counting: "Surveying district",
      "Calculating position": "Planning building placement",
      "Moving element": "Relocating building",
      "Sorting completed!": "City construction completed! 🏗️",
    };

    // Start the history log with a header
    state.els.stepHistory.innerHTML = "<h3>Construction Log:</h3>";

    // Go through the last few steps in the buffer and display them
    buffer.getLast().forEach((item) => {
      const div = document.createElement("div");
      div.className = `history-step${
        item.step === state.currentStep - 1 ? " active" : ""
      }`;
      div.textContent = Object.entries(steps).reduce(
        (desc, [key, val]) => desc.replace(key, val),
        item.data.description
      );
      // Make each history item clickable to jump back to that step
      div.addEventListener("click", () => replayToStep(item.step));
      state.els.stepHistory.appendChild(div);
    });
  };

  // Process next sorting step
  // This function moves the visualization forward by one step
  const nextStep = async () => {
    // If we've reached the end, mark sorting as complete
    if (state.currentStep >= state.sortingSteps.length) {
      state.sortingComplete = true;
      buffer.add({
        step: state.currentStep,
        data: { description: "Sorting completed!", type: "completion" },
      });
      updateHistory();
      updateButtons(true, true);
      return;
    }

    // Get the current step and the relevant indices for highlighting
    const step = state.sortingSteps[state.currentStep];
    const indices = sorter
      .getSteps()
      .slice(0, state.currentStep + 1)
      .filter((s) => s.type === "counting" && s.currentIndex !== undefined)
      .map((s) => s.currentIndex);

    // Update the arrays visually and get the next step index
    state.currentStep = await updateArrays(step, state.currentStep, indices);

    // If we've reached the end after this step, call nextStep again to finalize
    if (state.currentStep >= state.sortingSteps.length) nextStep();
  };

  // Utility functions for UI management
  // These functions help manage the state of buttons and dark mode
  const updateButtons = (started = false, complete = false) => {
    state.els.nextStep.disabled = !started || complete; // Disable 'Next Step' if not started or complete
    state.els.startSort.disabled = started && !complete; // Disable 'Start Sort' if already started but not complete
    state.els.addNumber.disabled = state.els.randomize.disabled = started; // Disable adding/randomizing numbers once started
  };

  const toggleDarkMode = () => {
    state.isDarkMode = !state.isDarkMode; // Flip the dark mode flag
    document.body.classList.toggle("dark-mode"); // Toggle the dark mode class on the body
    state.els.darkModeToggle.textContent = state.isDarkMode
      ? "Light Mode" // Change button text based on mode
      : "Dark Mode";
    visualizer.updateTheme?.(state.isDarkMode); // Update the visualizer theme if possible
  };

  const addNumbers = (count = 1) => {
    // Add either one random number or a bunch of random numbers to the array
    state.numbers =
      count === 1
        ? [...state.numbers, Math.floor(Math.random() * 20)]
        : Array.from({ length: count }, () => Math.floor(Math.random() * 20));

    // Update the visualizations with the new numbers
    visualizer.showArray("original-array", state.numbers);
    visualizer.showArray(
      "sorted-array",
      new Array(state.numbers.length),
      [],
      -1,
      true
    );
    updateButtons(); // Make sure buttons are in the correct state
  };

  // Initialize visualization and start sorting
  const startSort = () => {
    if (!state.numbers.length) return; // Don't start if there are no numbers
    state.currentStep = 0; // Reset to the first step
    state.sortingComplete = false; // Mark sorting as not complete
    buffer.clear(); // Clear the history buffer
    sorter.sortPlatforms(state.numbers); // Start the sorting process
    state.sortingSteps = sorter.getSteps(); // Get all the steps from the sorter
    updateButtons(true); // Update buttons to reflect that sorting has started
    nextStep(); // Start the first step
  };

  // Reset all state and clear visualizations
  const reset = () => {
    // Reset all the state variables to their initial values
    Object.assign(state, {
      numbers: [],
      currentStep: 0,
      sortingSteps: [],
      sortingComplete: false,
    });
    buffer.clear(); // Clear the history buffer
    visualizer.clear(); // Clear all visualizations
    state.els.stepHistory.innerHTML = "<h3>Construction Log:</h3>"; // Reset the history log
    updateButtons(); // Reset buttons to their initial state
  };

  // Initialize UI
  (() => {
    const labels = {
      addNumber: "Add Building",
      randomize: "Generate City Block",
      startSort: "Organize City",
      nextStep: "Next Phase",
      reset: "Clear City",
    };

    // Set up UI elements and event listeners
    // Assign text to buttons based on the labels object
    Object.entries(labels).forEach(
      ([id, text]) => (state.els[id].textContent = text)
    );
    document.querySelector(".speed-control label").textContent =
      "Construction Speed:"; // Update the label for speed control

    // Add event listeners to buttons for user interactions
    state.els.addNumber.addEventListener("click", () => addNumbers(1)); // Add one number
    state.els.randomize.addEventListener("click", () => addNumbers(8)); // Add eight random numbers
    state.els.startSort.addEventListener("click", startSort); // Start the sorting process
    state.els.nextStep.addEventListener("click", nextStep); // Move to the next step
    state.els.reset.addEventListener("click", reset); // Reset everything
    state.els.speedControl.addEventListener(
      "input",
      (e) => visualizer.setAnimationSpeed(1100 - parseInt(e.target.value)) // Adjust animation speed based on slider
    );
    state.els.darkModeToggle?.addEventListener("click", toggleDarkMode); // Toggle dark mode if the toggle exists

    // Check system dark mode preference and set it accordingly
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      toggleDarkMode();
    }

    updateButtons(); // Initialize button states
  })();
});
