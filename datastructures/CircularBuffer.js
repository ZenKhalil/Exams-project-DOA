class CircularBuffer {
  constructor(size) {
    // Initialize buffer with fixed size
    this.size = size;
    this.buffer = new Array(size); 
    this.current = 0; 
    this.count = 0; 
  }

  add(step) {
    // Add a step to the buffer
    this.buffer[this.current] = step; 
    this.current = (this.current + 1) % this.size; 
    this.count = Math.min(this.count + 1, this.size); 
  }

  getLast(n = 5) {
    // Retrieve the last `n` steps
    const steps = [];
    let index = this.current - 1; 
    for (let i = 0; i < Math.min(n, this.count); i++) {
      if (index < 0) index = this.size - 1; 
      steps.unshift(this.buffer[index]); 
      index--;
    }

    return steps; // Return the last `n` steps
  }

  clear() {
    // Clear the buffer
    this.buffer = new Array(this.size); 
    this.current = 0;
    this.count = 0; 
  }
}
 