class CircularBuffer {
  constructor(size) {
    this.size = size;
    this.buffer = new Array(size);
    this.current = 0;
    this.count = 0;
  }

  add(step) {
    this.buffer[this.current] = step;
    this.current = (this.current + 1) % this.size;
    this.count = Math.min(this.count + 1, this.size);
  }

  getLast(n = 5) {
    const steps = [];
    let index = this.current - 1;

    for (let i = 0; i < Math.min(n, this.count); i++) {
      if (index < 0) index = this.size - 1;
      steps.unshift(this.buffer[index]);
      index--;
    }

    return steps;
  }

  clear() {
    this.buffer = new Array(this.size);
    this.current = 0;
    this.count = 0;
  }
}
