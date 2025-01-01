class CircularBuffer {
  constructor(maxSize) {
    this.buffer = new Array(maxSize);
    this.head = 0;
    this.tail = 0;
    this.length = 0;
    this.maxSize = maxSize;
  }

  // Clear the buffer
  clear() {
    this.head = 0;
    this.tail = 0;
    this.length = 0;
    this.buffer = new Array(this.maxSize);
  }

  // Check if buffer is full
  isFull() {
    return this.length === this.maxSize;
  }

  // Check if buffer is empty
  isEmpty() {
    return this.length === 0;
  }

  // Get current size
  size() {
    return this.length;
  }

  // Add a new platform
  add(platform) {
    // Store the platform in the buffer
    this.buffer[this.tail] = platform;

    // Move tail to next position with wrapping
    this.tail = (this.tail + 1) % this.maxSize;

    // Update length and handle overwriting if buffer is full
    if (this.length < this.maxSize) {
      this.length++;
    } else {
      // Buffer is full, move head
      this.head = (this.head + 1) % this.maxSize;
    }

    return true;
  }

  // Get all visible platforms
  getVisiblePlatforms() {
    const platforms = [];
    let current = this.head;

    // Collect all platforms in order
    for (let i = 0; i < this.length; i++) {
      platforms.push(this.buffer[current]);
      current = (current + 1) % this.maxSize;
    }

    return platforms;
  }

  // Get a specific platform by index
  get(index) {
    if (index >= this.length) return null;
    const actualIndex = (this.head + index) % this.maxSize;
    return this.buffer[actualIndex];
  }

  // Remove oldest platform
  removeOldest() {
    if (this.isEmpty()) return null;

    const platform = this.buffer[this.head];
    this.head = (this.head + 1) % this.maxSize;
    this.length--;

    return platform;
  }
}
