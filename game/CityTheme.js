class CityTheme {
  constructor() {
    this.isNightMode = false;
    this.setupTheme();
  }

  setupTheme() {
    this.cityLabels = {
      original: "Construction Site",
      count: "City Districts",
      sorted: "Organized City",
      addBuilding: "Add Building",
      generateBlock: "Generate City Block",
      startSort: "Start Organization",
      constructionSpeed: "Construction Speed",
    }; 

    this.animations = {
      constructionDuration: 500,
      transitionDuration: 300,
    };
  }

  toggleDayNight() {
    this.isNightMode = !this.isNightMode;
    document.body.classList.toggle("night-mode");
    this.updateBuildingLights();
  }

  updateBuildingLights() {
    const windows = document.querySelectorAll(".window");
    windows.forEach((window) => {
      window.classList.toggle("lit", this.isNightMode);
    });
  }

  getThemeConfig() {
    return {
      labels: this.cityLabels,
      animations: this.animations,
      isNightMode: this.isNightMode,
    };
  }
}
