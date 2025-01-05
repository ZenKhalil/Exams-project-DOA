class CityBuilder {
  constructor(theme) {
    this.theme = theme;
    this.buildingTypes = {
      small: { maxFloors: 5, windowsPerFloor: 2 },
      medium: { maxFloors: 10, windowsPerFloor: 3 },
      large: { maxFloors: 15, windowsPerFloor: 4 },
    };
  }

  createBuildingElement(value, options = {}) {
    const building = document.createElement("div");
    building.className = "building number-element";

    // Bygningens højde baseret på værdi
    const height = 30 + value * 15;
    building.style.height = `${height}px`;

    // Tilføj bygningsdetaljer
    this.addBuildingDetails(building, value);

    // Tilføj klassenavne baseret på options
    if (options.placeholder) building.classList.add("placeholder");
    if (options.highlighted) building.classList.add("highlighted");
    if (options.processing) building.classList.add("processing");

    // Tilføj datainformation
    building.dataset.value = value;

    return building;
  }

  addBuildingDetails(building, value) {
    // Tilføj vinduer
    const windowsContainer = document.createElement("div");
    windowsContainer.className = "windows-container";

    const numWindows = Math.min(Math.floor(value * 1.5), 12);
    for (let i = 0; i < numWindows; i++) {
      const window = document.createElement("div");
      window.className = "window";
      if (this.theme.isNightMode) window.classList.add("lit");
      windowsContainer.appendChild(window);
    }
    building.appendChild(windowsContainer);

    // Tilføj dør
    const door = document.createElement("div");
    door.className = "door";
    building.appendChild(door);

    // Tilføj værdinummer på toppen af bygningen
    const valueLabel = document.createElement("div");
    valueLabel.className = "building-value";
    valueLabel.textContent = value;
    building.appendChild(valueLabel);
  }

  animateConstruction(building) {
    building.classList.add("constructing");
    setTimeout(() => {
      building.classList.remove("constructing");
    }, this.theme.animations.constructionDuration);
  }

  animateMove(building) {
    building.classList.add("moving");
    setTimeout(() => {
      building.classList.remove("moving");
    }, this.theme.animations.transitionDuration);
  }
}
