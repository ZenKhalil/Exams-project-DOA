function basicCountingSort(arr) {
  let max = Math.max(...arr);
  let count = new Array(max + 1).fill(0);

  // Tæl forekomster
  for (let num of arr) {
    count[num]++;
  }

  // Byg sorteret array
  let sorted = [];
  for (let i = 0; i < count.length; i++) {
    while (count[i] > 0) {
      sorted.push(i);
      count[i]--;
    }
  }
  return sorted;
}
