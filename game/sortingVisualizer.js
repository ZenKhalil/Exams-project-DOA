class SortingVisualizer {
  constructor() {
    // Grab the HTML elements where we'll display the arrays
    this.containers = {
      original: document.getElementById("original-array"), // Original unsorted array
      count: document.getElementById("count-array"), // Array used for counting sort
      sorted: document.getElementById("sorted-array"), // Final sorted array
    };
    this.animationSpeed = 500; // Default speed for animations in milliseconds
    this.isDarkMode = false; // Flag to track if dark mode is active

    // Initialize theme colors based on the current mode (light by default)
    this.updateThemeColors();
  }

  // Update the theme based on dark mode toggle
  updateTheme(isDarkMode) {
    this.isDarkMode = isDarkMode; // Set the dark mode flag
    this.updateThemeColors(); // Update color palette
    this.updateExistingElements(); // Apply new colors to existing elements
  }

  // Define colors for different elements based on the current theme
  updateThemeColors() {
    this.colors = {
      buildingBase: this.isDarkMode ? "#2c3e50" : "#3498db", // Base color of buildings
      buildingHighlight: this.isDarkMode ? "#e74c3c" : "#ff4444", // Highlight color for buildings
      buildingProcessing: this.isDarkMode ? "#27ae60" : "#2ecc71", // Color when a building is being processed
      windowLight: this.isDarkMode ? "#f1c40f" : "#ffffff", // Light color for windows
      windowDark: this.isDarkMode ? "#5b84a8" : "#2980b9", // Dark color for windows
      roofColor: this.isDarkMode ? "#34495e" : "#2c3e50", // Roof color
      doorColor: this.isDarkMode ? "#2c3e50" : "#34495e", // Door color
      textColor: this.isDarkMode ? "#ecf0f1" : "#2c3e50", // Text color on buildings
      valueSignBg: this.isDarkMode ? "#34495e" : "#ffffff", // Background color for value signs
      districtLabel: this.isDarkMode ? "#0b1112" : "#2c3e50", // Color for district labels
    };
  }

  // Apply the updated theme colors to all existing building elements
  updateExistingElements() {
    Object.values(this.containers).forEach((container) => {
      if (!container) return; // Skip if the container doesn't exist

      // Update each building in the container
      container.querySelectorAll(".building").forEach((building) => {
        this.applyThemeToBuilding(building); // Apply theme colors to the building
      });

      // Update district labels color
      container.querySelectorAll(".district-label").forEach((label) => {
        label.style.color = this.colors.districtLabel; // Set label color
      });
    });
  }

  // Apply theme colors to a single building element
  applyThemeToBuilding(building) {
    building.style.backgroundColor = this.colors.buildingBase; // Set building base color

    const valueSign = building.querySelector(".value-sign"); // Grab the value sign inside the building
    if (valueSign) {
      valueSign.style.backgroundColor = this.colors.valueSignBg; // Set background for value sign
      valueSign.style.color = this.colors.textColor; // Set text color for value sign
    }

    const windows = building.querySelectorAll(".window"); // Grab all windows in the building
    windows.forEach((window) => {
      window.style.backgroundColor = this.colors.windowDark; // Set window color
    });

    const roof = building.querySelector(".roof"); // Grab the roof element
    if (roof) {
      roof.style.borderBottomColor = this.colors.roofColor; // Set roof color
    }

    const door = building.querySelector(".door"); // Grab the door element
    if (door) {
      door.style.backgroundColor = this.colors.doorColor; // Set door color
    }
  }

  // Simple delay function to pause execution for animations
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Create a visual building element representing a number in the array
  async createArrayElement(value, options = {}) {
    const building = document.createElement("div"); // Create building div
    building.className = "building number-element"; // Assign classes
    if (options.isPlaceholder) building.classList.add("placeholder"); // Add placeholder class if needed

    const height = Math.max(30, value * 9); // Calculate height based on value
    building.style.height = `${height}px`; // Set building height
    building.style.backgroundColor = this.colors.buildingBase; // Set base color

    const buildingContent = document.createElement("div"); // Container for building content
    buildingContent.className = "building-content"; // Assign class

    const windowsContainer = document.createElement("div"); // Container for windows
    windowsContainer.className = "windows-container"; // Assign class

    const floors = Math.max(1, Math.floor(value / 2)); // Determine number of floors based on value
    for (let floor = 0; floor < floors; floor++) {
      const windowRow = document.createElement("div"); // Create a row for windows
      windowRow.className = "window-row"; // Assign class

      const windowsPerFloor = Math.min(3, Math.ceil(value / 3)); // Determine windows per floor
      for (let i = 0; i < windowsPerFloor; i++) {
        const window = document.createElement("div"); // Create window div
        window.className = "window"; // Assign class
        window.style.backgroundColor = this.colors.windowDark; // Set window color
        windowRow.appendChild(window); // Add window to the row
      }
      windowsContainer.appendChild(windowRow); // Add window row to the container
    }
    buildingContent.appendChild(windowsContainer); // Add windows container to building content

    const door = document.createElement("div"); // Create door div
    door.className = "door"; // Assign class
    door.style.backgroundColor = this.colors.doorColor; // Set door color
    buildingContent.appendChild(door); // Add door to building content

    const roof = document.createElement("div"); // Create roof div
    roof.className = "roof"; // Assign class
    roof.style.borderBottomColor = this.colors.roofColor; // Set roof color
    building.appendChild(roof); // Add roof to building

    const valueSign = document.createElement("div"); // Create value sign div
    valueSign.className = "value-sign"; // Assign class
    valueSign.textContent = value; // Set the number value
    valueSign.style.backgroundColor = this.colors.valueSignBg; // Set background color
    valueSign.style.color = this.colors.textColor; // Set text color
    building.appendChild(valueSign); // Add value sign to building

    building.appendChild(buildingContent); // Add all content to the building

    // If this is for the count array, wrap it with additional elements
    if (options.isCountArray) {
      const wrapper = document.createElement("div"); // Create a wrapper div
      wrapper.className = "district-wrapper"; // Assign class

      const label = document.createElement("div"); // Create district label
      label.className = "district-label"; // Assign class
      label.textContent = `District ${options.index}`; // Set label text
      label.style.color = this.colors.districtLabel; // Set label color

      wrapper.appendChild(building); // Add building to wrapper
      wrapper.appendChild(label); // Add label to wrapper
      return wrapper; // Return the wrapped building
    }

    return building; // Return the building element
  }

  // Update an existing building element with a new value
  async updateElement(element, newValue, options = {}) {
    if (!element) return; // If no element provided, exit

    // Determine which part to update based on whether it's a count array
    const building = options.isCountArray
      ? element.querySelector(".building") || element
      : element;

    if (!building) return; // If building element not found, exit

    const valueSign = building.querySelector(".value-sign"); // Grab the value sign
    const oldValue = valueSign?.textContent; // Get the current value

    // If the value has changed, update the building's visuals
    if (oldValue !== newValue?.toString()) {
      building.classList.add("construction"); // Add a class to indicate construction
      await this.delay(this.animationSpeed / 2); // Wait for half the animation speed

      const height = Math.max(30, newValue * 9); // Recalculate height
      building.style.height = `${height}px`; // Update building height

      if (valueSign) {
        valueSign.textContent = newValue; // Update the value sign text
      }

      let windowsContainer = building.querySelector(".windows-container"); // Get windows container
      if (!windowsContainer) {
        windowsContainer = document.createElement("div"); // Create if it doesn't exist
        windowsContainer.className = "windows-container"; // Assign class
        building.appendChild(windowsContainer); // Add to building
      }

      windowsContainer.innerHTML = ""; // Clear existing windows

      const floors = Math.max(1, Math.floor(newValue / 2)); // Recalculate floors
      for (let floor = 0; floor < floors; floor++) {
        const windowRow = document.createElement("div"); // Create a new window row
        windowRow.className = "window-row"; // Assign class

        const windowsPerFloor = Math.min(3, Math.ceil(newValue / 3)); // Determine windows per floor
        for (let i = 0; i < windowsPerFloor; i++) {
          const window = document.createElement("div"); // Create window div
          window.className = "window"; // Assign class
          window.style.backgroundColor = this.colors.windowDark; // Set window color
          windowRow.appendChild(window); // Add window to the row
        }
        windowsContainer.appendChild(windowRow); // Add row to windows container
      }

      building.classList.remove("construction"); // Remove construction class after update
    }

    // Toggle highlight and processing classes based on options
    building.classList.toggle(
      "highlighted",
      options.highlights?.includes(options.index)
    );
    building.classList.toggle(
      "processing",
      options.index === options.activeIndex
    );

    // Reapply theme colors in case they changed
    this.applyThemeToBuilding(building);
  }

  // Display the entire array in the specified container with optional highlights
  async showArray(
    containerId,
    array,
    highlights = [],
    activeIndex = -1,
    isPlaceholder = false
  ) {
    const containerKey = containerId.split("-")[0]; // Extract key (e.g., 'original' from 'original-array')
    const container = this.containers[containerKey]; // Get the corresponding container element

    if (!container) return; // If container doesn't exist, exit

    const isCountArray = containerId === "count-array"; // Check if it's the count array
    const options = { highlights, activeIndex, isPlaceholder, isCountArray }; // Prepare options for building elements

    // If the number of elements matches, just update existing elements
    if (container.children.length === array.length) {
      await Promise.all(
        array.map((value, index) => {
          const elementToUpdate = isCountArray
            ? container.children[index]?.querySelector(".building") ||
              container.children[index]
            : container.children[index];
          return this.updateElement(elementToUpdate, value, {
            ...options,
            index,
          });
        })
      );
      return; // We're done updating
    }

    // If the number of elements doesn't match, rebuild the array display
    container.innerHTML = ""; // Clear existing content
    for (let i = 0; i < array.length; i++) {
      const element = await this.createArrayElement(array[i], {
        ...options,
        index: i,
      });
      await this.animateArrayChange(container, element); // Animate adding the new element
    }
  }

  // Animate the addition of a new building element to the container
  async animateArrayChange(container, element) {
    if (!container || !element) return; // If no container or element, exit

    element.style.opacity = "0"; // Start invisible
    element.style.transform = "translateY(-20px)"; // Start slightly above
    container.appendChild(element); // Add to the container
    await this.delay(this.animationSpeed / 10); // Wait a bit
    element.style.opacity = "1"; // Fade in
    element.style.transform = "translateY(0)"; // Move to original position
  }

  // Set the speed of animations (higher number means slower animations)
  setAnimationSpeed(speed) {
    this.animationSpeed = 1100 - speed; // Adjust speed based on input
  }

  // Clear all array displays
  clear() {
    Object.values(this.containers).forEach(
      (container) => container && (container.innerHTML = "")
    );
  }
}
