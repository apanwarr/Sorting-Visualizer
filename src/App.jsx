import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Shuffle, Plus, Minus } from 'lucide-react';

const App = () => {
  const [array, setArray] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [delay, setDelay] = useState(200);
  const [size, setSize] = useState(20);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [inputMode, setInputMode] = useState('random');

  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentDelayRef = useRef(200);

  const algorithms = {
    bubble: 'Bubble Sort',
    selection: 'Selection Sort',
    insertion: 'Insertion Sort',
    merge: 'Merge Sort',
    quick: 'Quick Sort'
  };

  const speedOptions = {
    slow: 500,
    medium: 200,
    fast: 50
  };

  useEffect(() => {
    currentDelayRef.current = delay;
  }, [delay]);

  const generateRandomArray = useCallback(() => {
    const newArray = Array.from({ length: size }, () =>
      Math.floor(Math.random() * 300) + 10
    );
    setArray(newArray);
    resetVisualization();
  }, [size]);

  const parseCustomInput = () => {
    try {
      const numbers = customInput
        .split(',')
        .map(num => parseInt(num.trim()))
        .filter(num => !isNaN(num) && num > 0 && num <= 400);
      
      if (numbers.length > 0) {
        setArray(numbers);
        setSize(numbers.length);
        resetVisualization();
      }
    } catch (error) {
      alert('Please enter valid numbers separated by commas');
    }
  };

  const resetVisualization = () => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    setIsSorting(false);
    setIsPaused(false);
    setComparing([]);
    setSwapping([]);
    setSorted([]);
  };

  useEffect(() => {
    generateRandomArray();
  }, [generateRandomArray]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const waitForResume = async () => {
    while (isPausedRef.current && isRunningRef.current) {
      await sleep(50);
    }
  };

  // Bubble Sort Algorithm
  const bubbleSort = async () => {
    const arr = [...array];
    const n = arr.length;
    
    for (let i = 0; i < n - 1 && isRunningRef.current; i++) {
      for (let j = 0; j < n - i - 1 && isRunningRef.current; j++) {
        await waitForResume();
        if (!isRunningRef.current) return;
    
        setComparing([j, j + 1]);
        await sleep(currentDelayRef.current);
        
        if (arr[j] > arr[j + 1]) {
          setSwapping([j, j + 1]);
          
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          
          await sleep(currentDelayRef.current);
        }
        
        setSwapping([]);
      }
      setSorted(prev => [...prev, n - 1 - i]);
    }
    
    setSorted(prev => [...prev, 0]);
    setComparing([]);
  };

  const selectionSort = async () => {
    const arr = [...array];
    const n = arr.length;
    
    for (let i = 0; i < n - 1 && isRunningRef.current; i++) {
      let minIdx = i;
      setComparing([i]);
      
      for (let j = i + 1; j < n && isRunningRef.current; j++) {
        await waitForResume();
        if (!isRunningRef.current) return;
        
        setComparing([i, j, minIdx]);
        await sleep(currentDelayRef.current);
        
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      
      if (minIdx !== i) {
        setSwapping([i, minIdx]);
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray([...arr]);
        await sleep(currentDelayRef.current);
      }
      
      setSorted(prev => [...prev, i]);
      setSwapping([]);
    }
    
    setSorted(prev => [...prev, n - 1]);
    setComparing([]);
  };

  // Insertion Sort Algorithm
  const insertionSort = async () => {
    const arr = [...array];
    setSorted([0]);
    
    for (let i = 1; i < arr.length && isRunningRef.current; i++) {
      let key = arr[i];
      let j = i - 1;
      
      setComparing([i]);
      await sleep(currentDelayRef.current);
      
      while (j >= 0 && arr[j] > key && isRunningRef.current) {
        await waitForResume();
        if (!isRunningRef.current) return;
        
        setSwapping([j, j + 1]);
        arr[j + 1] = arr[j];
        setArray([...arr]);
        await sleep(currentDelayRef.current);
        j--;
      }
      
      arr[j + 1] = key;
      setArray([...arr]);
      setSorted(prev => [...prev, i]);
      setSwapping([]);
    }
    
    setComparing([]);
  };

  // Merge Sort Algorithm
  const mergeSort = async () => {
  const arr = [...array];

  const merge = async (left, mid, right) => {
    let n1 = mid - left + 1;
    let n2 = right - mid;

    let L = arr.slice(left, mid + 1);
    let R = arr.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;

    while (i < n1 && j < n2) {
      await waitForResume();
      setComparing([left + i, mid + 1 + j]);
      await sleep(currentDelayRef.current);

      if (L[i] <= R[j]) {
        arr[k++] = L[i++];
      } else {
        arr[k++] = R[j++];
      }

      setArray([...arr]);
    }

    while (i < n1) {
      arr[k++] = L[i++];
      setArray([...arr]);
      await sleep(currentDelayRef.current);
    }

    while (j < n2) {
      arr[k++] = R[j++];
      setArray([...arr]);
      await sleep(currentDelayRef.current);
    }
  };

    const mergeSortHelper = async (left, right) => {
      if (left >= right || !isRunningRef.current) return;
      const mid = Math.floor((left + right) / 2);
      await mergeSortHelper(left, mid);
      await mergeSortHelper(mid + 1, right);
      await merge(left, mid, right);
      setSorted(prev => [...prev, ...Array.from({ length: right - left + 1 }, (_, i) => left + i)]);
    };

    await mergeSortHelper(0, arr.length - 1);
    setComparing([]);
  };

  //Quick Sort Algorithm
  const quickSort = async () => {
  const arr = [...array];

  const partition = async (low, high) => {
    let pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      await waitForResume();
      setComparing([j, high]);
      await sleep(currentDelayRef.current);

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setSwapping([i, j]);
        setArray([...arr]);
        await sleep(currentDelayRef.current);
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setSwapping([i + 1, high]);
    setArray([...arr]);
    await sleep(currentDelayRef.current);
    return i + 1;
  };

  const quickSortHelper = async (low, high) => {
    if (low < high && isRunningRef.current) {
      const pi = await partition(low, high);
      await quickSortHelper(low, pi - 1);
      await quickSortHelper(pi + 1, high);
      setSorted(prev => [...prev, pi]);
    }
  };

    await quickSortHelper(0, arr.length - 1);
    setSorted(prev => [...prev, ...array.map((_, i) => i)]);
    setComparing([]);
    setSwapping([]);
  };

  const handleStart = async () => {
    
    if (isSorting && isPaused) {
      console.log('Resuming...');
      setIsPaused(false);
      isPausedRef.current = false;
      return;
    }
    resetVisualization();
    setIsSorting(true);
    isRunningRef.current = true;
    
    try {
      switch (algorithm) {
        case 'bubble':
          await bubbleSort();
          break;
        case 'selection':
          await selectionSort();
          break;
        case 'insertion':
          await insertionSort();
          break;
        case 'merge':
          await mergeSort();
          break;
        case 'quick':
          await quickSort();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error during sorting:', error);
    } finally {
      setIsSorting(false);
      isRunningRef.current = false;
    }
  };

  const handlePause = () => {
    console.log('Pause button clicked');
    setIsPaused(true);
    isPausedRef.current = true;
  };

  const handleReset = () => {
    resetVisualization();
    if (inputMode === 'random') {
      generateRandomArray();
    }
  };

  const handleShuffle = () => {
    generateRandomArray();
  };

  const handleIncreaseSize = () => {
    if (size < 100) setSize(size + 1);
  };

  const handleDecreaseSize = () => {
    if (size > 5) setSize(size - 1);
  };

  const getBarColor = (index) => {
    if (sorted.includes(index)) return 'bg-green-500';
    if (swapping.includes(index)) return 'bg-red-500';
    if (comparing.includes(index)) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const maxHeight = Math.max(...array);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            Sorting Visualizer
          </h1>
          <p className="text-gray-300 text-lg">
            Watch sorting algorithms come to life with beautiful animations
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Input Mode</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setInputMode('random')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    inputMode === 'random'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/20 text-gray-300 hover:bg-white/30'
                  }`}
                  disabled={isSorting}
                >
                  Random
                </button>
                <button
                  onClick={() => setInputMode('custom')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    inputMode === 'custom'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/20 text-gray-300 hover:bg-white/30'
                  }`}
                  disabled={isSorting}
                >
                  Custom
                </button>
              </div>

              {inputMode === 'random' && (
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm">Array Size: {size}</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDecreaseSize}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                      disabled={isSorting}
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={size}
                      onChange={(e) => setSize(parseInt(e.target.value))}
                      className="cursor-pointer flex-1"
                      disabled={isSorting}
                    />
                    <button
                      onClick={handleIncreaseSize}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                      disabled={isSorting}
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {inputMode === 'custom' && (
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm">Enter numbers (comma-separated):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="e.g., 64,34,25,12,22,11,90"
                      className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSorting}
                    />
                    <button
                      onClick={parseCustomInput}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      disabled={isSorting}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Algorithm & Speed</h3>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSorting}
              >
                {Object.entries(algorithms).map(([key, name]) => (
                  <option key={key} value={key} className="bg-gray-800">
                    {name}
                  </option>
                ))}
              </select>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Speed: {delay}ms</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(speedOptions).map(([speed, value]) => (
                    <button
                      key={speed}
                      onClick={() => setDelay(value)}
                      className={`cursor-pointer px-3 py-2 rounded-lg font-medium transition-all capitalize ${
                        delay === value
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/20 text-gray-300 hover:bg-white/30'
                      }`}
                      disabled={isSorting}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Controls</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStart}
                  disabled={isSorting && !isPaused}
                  className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  {isPaused ? 'Resume' : 'Start'}
                </button>
                
                <button
                  onClick={handlePause}
                  disabled={!isSorting || isPaused}
                  className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white rounded-lg font-medium transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
                
                <button
                  onClick={handleReset}
                  className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                
                <button
                  onClick={handleShuffle}
                  disabled={isSorting || inputMode === 'custom'}
                  className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-end justify-center gap-1 h-96 overflow-x-auto">
            {array.map((value, index) => (
              <div
                key={index}
                className={`transition-all duration-300 rounded-t-lg min-w-[8px] flex items-end justify-center ${getBarColor(index)}`}
                style={{
                  height: `${(value / maxHeight) * 340}px`,
                  width: `${Math.max(8, Math.min(40, 800 / array.length))}px`,
                }}
              >
                {array.length <= 30 && (
                  <span className="text-white text-xs font-bold mb-1 transform -rotate-90 origin-center">
                    {value}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-300">Unsorted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-300">Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-300">Swapping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-300">Sorted</span>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-white font-semibold text-xl mb-4">
            Current Algorithm: {algorithms[algorithm]}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
            <div>
              <strong className="text-white">Time Complexity:</strong>
              <div className="mt-1">
                {algorithm === 'bubble' && 'O(n²)'}
                {algorithm === 'selection' && 'O(n²)'}
                {algorithm === 'insertion' && 'O(n²)'}
                {algorithm === 'merge' && 'O(n log n)'}
                {algorithm === 'quick' && 'Average: O(n log n), Worst: O(n²)'}
              </div>
            </div>
            <div>
              <strong className="text-white">Space Complexity:</strong>
              <div className="mt-1">
                {(algorithm === 'bubble' || algorithm === 'selection' || algorithm === 'insertion') && 'O(1)'}
                {algorithm === 'merge' && 'O(n)'}
                {algorithm === 'quick' && 'O(log n)'}
              </div>
            </div>
            <div>
              <strong className="text-white">Stability:</strong>
              <div className="mt-1">
                {(algorithm === 'bubble' || algorithm === 'insertion' || algorithm === 'merge') && 'Stable'}
                {(algorithm === 'selection' || algorithm === 'quick') && 'Unstable'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;