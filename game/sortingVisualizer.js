class SortingVisualizer {
  constructor() {
    this.containers = {
      original: document.getElementById("original-array"),
      count: document.getElementById("count-array"),
      sorted: document.getElementById("sorted-array"),
    };
    this.animationSpeed = 500;
    this.isDarkMode = false;

    // Theme colors
    this.updateThemeColors();
  }

  updateTheme(isDarkMode) {
    this.isDarkMode = isDarkMode;
    this.updateThemeColors();
    this.updateExistingElements();
  }

  updateThemeColors() {
    this.colors = {
      buildingBase: this.isDarkMode ? "#2c3e50" : "#3498db",
      buildingHighlight: this.isDarkMode ? "#e74c3c" : "#ff4444",
      buildingProcessing: this.isDarkMode ? "#27ae60" : "#2ecc71",
      windowLight: this.isDarkMode ? "#f1c40f" : "#ffffff",
      windowDark: this.isDarkMode ? "#5b84a8" : "#2980b9",
      roofColor: this.isDarkMode ? "#34495e" : "#2c3e50",
      doorColor: this.isDarkMode ? "#2c3e50" : "#34495e",
      textColor: this.isDarkMode ? "#ecf0f1" : "#2c3e50",
      valueSignBg: this.isDarkMode ? "#34495e" : "#ffffff",
      districtLabel: this.isDarkMode ? "#0b1112" : "#2c3e50",
    };
  }

  updateExistingElements() {
    Object.values(this.containers).forEach((container) => {
      if (!container) return;

      container.querySelectorAll(".building").forEach((building) => {
        this.applyThemeToBuilding(building);
      });

      container.querySelectorAll(".district-label").forEach((label) => {
        label.style.color = this.colors.districtLabel;
      });
    });
  }

  applyThemeToBuilding(building) {
    building.style.backgroundColor = this.colors.buildingBase;

    const valueSign = building.querySelector(".value-sign");
    if (valueSign) {
      valueSign.style.backgroundColor = this.colors.valueSignBg;
      valueSign.style.color = this.colors.textColor;
    }

    const windows = building.querySelectorAll(".window");
    windows.forEach((window) => {
      window.style.backgroundColor = this.colors.windowDark;
    });

    const roof = building.querySelector(".roof");
    if (roof) {
      roof.style.borderBottomColor = this.colors.roofColor;
    }

    const door = building.querySelector(".door");
    if (door) {
      door.style.backgroundColor = this.colors.doorColor;
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async createArrayElement(value, options = {}) {
    const building = document.createElement("div");
    building.className = "building number-element";
    if (options.isPlaceholder) building.classList.add("placeholder");

    const height = Math.max(30, value * 9);
    building.style.height = `${height}px`;
    building.style.backgroundColor = this.colors.buildingBase;

    const buildingContent = document.createElement("div");
    buildingContent.className = "building-content";

    const windowsContainer = document.createElement("div");
    windowsContainer.className = "windows-container";

    const floors = Math.max(1, Math.floor(value / 2));
    for (let floor = 0; floor < floors; floor++) {
      const windowRow = document.createElement("div");
      windowRow.className = "window-row";

      const windowsPerFloor = Math.min(3, Math.ceil(value / 3));
      for (let i = 0; i < windowsPerFloor; i++) {
        const window = document.createElement("div");
        window.className = "window";
        window.style.backgroundColor = this.colors.windowDark;
        windowRow.appendChild(window);
      }
      windowsContainer.appendChild(windowRow);
    }
    buildingContent.appendChild(windowsContainer);

    const door = document.createElement("div");
    door.className = "door";
    door.style.backgroundColor = this.colors.doorColor;
    buildingContent.appendChild(door);

    const roof = document.createElement("div");
    roof.className = "roof";
    roof.style.borderBottomColor = this.colors.roofColor;
    building.appendChild(roof);

    const valueSign = document.createElement("div");
    valueSign.className = "value-sign";
    valueSign.textContent = value;
    valueSign.style.backgroundColor = this.colors.valueSignBg;
    valueSign.style.color = this.colors.textColor;
    building.appendChild(valueSign);

    building.appendChild(buildingContent);

    if (options.isCountArray) {
      const wrapper = document.createElement("div");
      wrapper.className = "district-wrapper";

      const label = document.createElement("div");
      label.className = "district-label";
      label.textContent = `District ${options.index}`;
      label.style.color = this.colors.districtLabel;

      wrapper.appendChild(building);
      wrapper.appendChild(label);
      return wrapper;
    }

    return building;
  }

  async updateElement(element, newValue, options = {}) {
    if (!element) return;

    const building = options.isCountArray
      ? element.querySelector(".building") || element
      : element;

    if (!building) return;

    const valueSign = building.querySelector(".value-sign");
    const oldValue = valueSign?.textContent;

    if (oldValue !== newValue?.toString()) {
      building.classList.add("construction");
      await this.delay(this.animationSpeed / 2);

      const height = Math.max(30, newValue * 9);
      building.style.height = `${height}px`;

      if (valueSign) {
        valueSign.textContent = newValue;
      }

      let windowsContainer = building.querySelector(".windows-container");
      if (!windowsContainer) {
        windowsContainer = document.createElement("div");
        windowsContainer.className = "windows-container";
        building.appendChild(windowsContainer);
      }

      windowsContainer.innerHTML = "";

      const floors = Math.max(1, Math.floor(newValue / 2));
      for (let floor = 0; floor < floors; floor++) {
        const windowRow = document.createElement("div");
        windowRow.className = "window-row";

        const windowsPerFloor = Math.min(3, Math.ceil(newValue / 3));
        for (let i = 0; i < windowsPerFloor; i++) {
          const window = document.createElement("div");
          window.className = "window";
          window.style.backgroundColor = this.colors.windowDark;
          windowRow.appendChild(window);
        }
        windowsContainer.appendChild(windowRow);
      }

      building.classList.remove("construction");
    }

    building.classList.toggle(
      "highlighted",
      options.highlights?.includes(options.index)
    );
    building.classList.toggle(
      "processing",
      options.index === options.activeIndex
    );

    // Apply theme colors
    this.applyThemeToBuilding(building);
  }

  async showArray(
    containerId,
    array,
    highlights = [],
    activeIndex = -1,
    isPlaceholder = false
  ) {
    const containerKey = containerId.split("-")[0];
    const container = this.containers[containerKey];

    if (!container) return;

    const isCountArray = containerId === "count-array";
    const options = { highlights, activeIndex, isPlaceholder, isCountArray };

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
      return;
    }

    container.innerHTML = "";
    for (let i = 0; i < array.length; i++) {
      const element = await this.createArrayElement(array[i], {
        ...options,
        index: i,
      });
      await this.animateArrayChange(container, element);
    }
  }

  async animateArrayChange(container, element) {
    if (!container || !element) return;

    element.style.opacity = "0";
    element.style.transform = "translateY(-20px)";
    container.appendChild(element);
    await this.delay(this.animationSpeed / 10);
    element.style.opacity = "1";
    element.style.transform = "translateY(0)";
  }

  setAnimationSpeed(speed) {
    this.animationSpeed = 1100 - speed;
  }

  clear() {
    Object.values(this.containers).forEach(
      (container) => container && (container.innerHTML = "")
    );
  }
}
