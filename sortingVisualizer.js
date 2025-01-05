class SortingVisualizer {
  constructor() {
    // Initialize containers and animation speed
    this.containers = {
      original: document.getElementById("original-array"),
      count: document.getElementById("count-array"),
      sorted: document.getElementById("sorted-array"),
    };
    this.animationSpeed = 500;
  }

  // Delay execution for a given duration
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Create a visual array element
  async createArrayElement(value, options = {}) {
    const element = document.createElement("div");
    element.className = `number-element${
      options.isPlaceholder ? " placeholder" : ""
    }`;
    element.textContent = value !== undefined ? value : "_";

    // Highlight and process element as needed
    if (options.highlights?.includes(options.index)) {
      element.classList.add("highlighted");
    }
    if (options.index === options.activeIndex) {
      element.classList.add("processing");
    }

    // Add labels for count array elements
    if (options.isCountArray) {
      const wrapper = document.createElement("div");
      wrapper.className = "count-element-wrapper";
      const label = document.createElement("div");
      label.className = "count-label";
      label.textContent = `num ${options.index}`;
      wrapper.appendChild(element);
      wrapper.appendChild(label);
      return wrapper;
    }

    // Add position indicators for placeholders
    if (options.isPlaceholder) {
      const position = document.createElement("div");
      position.className = "position-indicator";
      position.textContent = `pos ${options.index}`;
      element.appendChild(position);
    }

    return element;
  }

  // Animate the addition of a new array element
  async animateArrayChange(container, element) {
    element.style.opacity = "0";
    container.appendChild(element);
    await this.delay(this.animationSpeed / 10);
    element.style.opacity = "1";
  }

  // Update an existing array element
  async updateElement(element, newValue, options = {}) {
    const oldValue = element.textContent;
    const displayValue = newValue !== undefined ? newValue.toString() : "_";

    // Animate changes in element value
    if (oldValue !== displayValue) {
      element.classList.add("changing");
      await this.delay(this.animationSpeed / 5);
      element.textContent = displayValue;
      element.className = "number-element";
    }

    // Highlight or process element as needed
    if (options.highlights?.includes(options.index)) {
      element.classList.add("highlighted");
    }
    if (options.index === options.activeIndex) {
      if (
        options.isCountArray &&
        !options.highlights?.includes(options.index)
      ) {
        element.classList.add("processing");
        await this.delay(this.animationSpeed / 2);
        element.classList.remove("processing");
      } else {
        element.classList.add("processing");
      }
    }
  }

  // Visualize an array in the specified container
  async showArray(
    containerId,
    array,
    highlights = [],
    activeIndex = -1,
    isPlaceholder = false
  ) {
    const containerKey = containerId.split("-")[0];
    const container = this.containers[containerKey];
    const isCountArray = containerId === "count-array";
    const options = { highlights, activeIndex, isPlaceholder, isCountArray };

    // Update existing elements if the array size matches
    if (container.children.length === array.length) {
      await Promise.all(
        array.map((value, index) => {
          const elementToUpdate = isCountArray
            ? container.children[index].querySelector(".number-element")
            : container.children[index];
          return this.updateElement(elementToUpdate, value, {
            ...options,
            index,
          });
        })
      );
      return;
    }

    // Create new elements if array size differs
    container.innerHTML = "";
    for (let i = 0; i < array.length; i++) {
      const element = await this.createArrayElement(array[i], {
        ...options,
        index: i,
      });
      await this.animateArrayChange(container, element);
    }
  }

  // Adjust the animation speed
  setAnimationSpeed(speed) {
    this.animationSpeed = 1100 - speed;
  }

  // Clear all containers
  clear() {
    Object.values(this.containers).forEach(
      (container) => (container.innerHTML = "")
    );
  }
}
