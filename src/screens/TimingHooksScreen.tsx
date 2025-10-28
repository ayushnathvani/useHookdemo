import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import { useDebounce, useThrottle } from '@uidotdev/usehooks';

// Custom hook implementations for hooks not available in the library
const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<() => void>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current?.(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<() => void>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setTimeout(() => savedCallback.current?.(), delay);
      return () => clearTimeout(id);
    }
  }, [delay]);
};

const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    return Math.max(0, target - now);
  });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const target = targetDate.getTime();
        const difference = Math.max(0, target - now);
        setTimeLeft(difference);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [targetDate, isActive]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const start = () => setIsActive(true);
  const stop = () => setIsActive(false);
  const reset = (newDate?: Date) => {
    setIsActive(false);
    if (newDate) {
      const now = new Date().getTime();
      const target = newDate.getTime();
      setTimeLeft(Math.max(0, target - now));
    }
  };

  return [
    { days, hours, minutes, seconds },
    { start, stop, reset },
  ] as const;
};

const useRandomInterval = (
  callback: () => void,
  minDelay: number | null,
  maxDelay: number | null,
) => {
  const savedCallback = useRef<() => void>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (minDelay !== null && maxDelay !== null) {
      const scheduleNext = (): NodeJS.Timeout => {
        const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
        return setTimeout(() => {
          savedCallback.current?.();
          scheduleNext();
        }, randomDelay);
      };

      const id = scheduleNext();
      return () => clearTimeout(id);
    }
  }, [minDelay, maxDelay]);
};

const useIntervalWhen = (
  callback: () => void,
  delay: number,
  when: boolean,
) => {
  const savedCallback = useRef<() => void>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (when && delay) {
      const id = setInterval(() => savedCallback.current?.(), delay);
      return () => clearInterval(id);
    }
  }, [delay, when]);
};

const TimingHooksScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <IntervalDemo isDarkMode={isDarkMode} />
      <TimeoutDemo isDarkMode={isDarkMode} />
      <CountdownDemo isDarkMode={isDarkMode} />
      <DebounceDemo isDarkMode={isDarkMode} />
      <ThrottleDemo isDarkMode={isDarkMode} />
      <RandomIntervalDemo isDarkMode={isDarkMode} />
      <IntervalWhenDemo isDarkMode={isDarkMode} />
    </ScrollView>
  );
};

const IntervalDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [count, setCount] = useState(0);
  const [delay, setDelay] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);

  useInterval(
    () => {
      setCount(count + 1);
    },
    isRunning ? delay : null,
  );

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useInterval
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Execute a function repeatedly at specified intervals
      </Text>

      <View style={styles.timerDisplay}>
        <Text style={[styles.timerValue, isDarkMode && styles.darkText]}>
          Count: {count}
        </Text>
        <Text style={[styles.timerInfo, isDarkMode && styles.darkDescription]}>
          Interval: {delay}ms | Status: {isRunning ? 'Running' : 'Stopped'}
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Delay (ms)"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={delay.toString()}
          onChangeText={text => setDelay(parseInt(text, 10) || 1000)}
          keyboardType="numeric"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, isRunning && styles.stopButton]}
            onPress={() => setIsRunning(!isRunning)}
          >
            <Text style={styles.buttonText}>
              {isRunning ? 'Stop' : 'Start'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setCount(0)}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Auto-refresh data, animations, polling APIs, progress
        updates
      </Text>
    </View>
  );
};

const TimeoutDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [message, setMessage] = useState('');
  const [delay, setDelay] = useState(3000);

  const showMessage = () => {
    setMessage('Timeout started...');
  };

  useTimeout(
    () => {
      setMessage('Timeout completed! 🎉');
    },
    message === 'Timeout started...' ? delay : null,
  );

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useTimeout
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Execute a function once after a specified delay
      </Text>

      <View style={styles.timeoutContainer}>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Delay (ms)"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={delay.toString()}
          onChangeText={text => setDelay(parseInt(text, 10) || 3000)}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={showMessage}>
          <Text style={styles.buttonText}>Start Timeout ({delay}ms)</Text>
        </TouchableOpacity>

        {message && (
          <View style={styles.messageContainer}>
            <Text style={[styles.messageText, isDarkMode && styles.darkText]}>
              {message}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setMessage('')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Notifications, auto-save, delayed actions, UI feedback
      </Text>
    </View>
  );
};

const CountdownDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 60000)); // 1 minute from now

  const [{ days, hours, minutes, seconds }, { start, stop, reset }] =
    useCountdown(targetDate);

  const addMinute = () => {
    const newDate = new Date(targetDate.getTime() + 60000);
    setTargetDate(newDate);
    reset(newDate);
  };

  const isFinished =
    days === 0 && hours === 0 && minutes === 0 && seconds === 0;

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useCountdown
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Create countdown timers with days, hours, minutes, and seconds
      </Text>

      <View style={styles.countdownDisplay}>
        <View style={styles.countdownUnit}>
          <Text style={[styles.countdownNumber, isDarkMode && styles.darkText]}>
            {days}
          </Text>
          <Text
            style={[
              styles.countdownLabel,
              isDarkMode && styles.darkDescription,
            ]}
          >
            Days
          </Text>
        </View>
        <View style={styles.countdownUnit}>
          <Text style={[styles.countdownNumber, isDarkMode && styles.darkText]}>
            {hours}
          </Text>
          <Text
            style={[
              styles.countdownLabel,
              isDarkMode && styles.darkDescription,
            ]}
          >
            Hours
          </Text>
        </View>
        <View style={styles.countdownUnit}>
          <Text style={[styles.countdownNumber, isDarkMode && styles.darkText]}>
            {minutes}
          </Text>
          <Text
            style={[
              styles.countdownLabel,
              isDarkMode && styles.darkDescription,
            ]}
          >
            Minutes
          </Text>
        </View>
        <View style={styles.countdownUnit}>
          <Text style={[styles.countdownNumber, isDarkMode && styles.darkText]}>
            {seconds}
          </Text>
          <Text
            style={[
              styles.countdownLabel,
              isDarkMode && styles.darkDescription,
            ]}
          >
            Seconds
          </Text>
        </View>
      </View>

      {isFinished && (
        <Text style={[styles.finishedText, isDarkMode && styles.darkText]}>
          🎉 Countdown Finished!
        </Text>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={start}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={stop}
        >
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={addMinute}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            +1 Min
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Event countdowns, time-limited offers, exam timers, break
        timers
      </Text>
    </View>
  );
};

const DebounceDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [delay, setDelay] = useState(500);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);
  const [searchResults, setSearchResults] = useState<string[]>([]);

  // Simulate search
  React.useEffect(() => {
    if (debouncedSearchTerm) {
      const results = [
        'Apple iPhone',
        'Apple iPad',
        'Apple Watch',
        'MacBook Pro',
        'MacBook Air',
        'iMac',
      ].filter(item =>
        item.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useDebounce
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Delay execution until after wait time has elapsed since last call
      </Text>

      <View style={styles.debounceContainer}>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Search products..."
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <View style={styles.debounceInfo}>
          <Text
            style={[styles.debounceText, isDarkMode && styles.darkDescription]}
          >
            Current: "{searchTerm}"
          </Text>
          <Text
            style={[styles.debounceText, isDarkMode && styles.darkDescription]}
          >
            Debounced: "{debouncedSearchTerm}"
          </Text>
          <Text
            style={[styles.debounceText, isDarkMode && styles.darkDescription]}
          >
            Delay: {delay}ms
          </Text>
        </View>

        <TextInput
          style={[
            styles.input,
            styles.smallInput,
            isDarkMode && styles.darkInput,
          ]}
          placeholder="Delay (ms)"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={delay.toString()}
          onChangeText={text => setDelay(parseInt(text, 10) || 500)}
          keyboardType="numeric"
        />

        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <Text style={[styles.resultsTitle, isDarkMode && styles.darkText]}>
              Search Results:
            </Text>
            {searchResults.map((result, index) => (
              <Text
                key={index}
                style={[
                  styles.resultItem,
                  isDarkMode && styles.darkDescription,
                ]}
              >
                • {result}
              </Text>
            ))}
          </View>
        )}
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Search inputs, API calls, form validation, resize handlers
      </Text>
    </View>
  );
};

const ThrottleDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [clickCount, setClickCount] = useState(0);
  const [throttledCount, setThrottledCount] = useState(0);
  const [limit, setLimit] = useState(1000);

  const throttledIncrement = useThrottle(() => {
    setThrottledCount(prev => prev + 1);
  }, limit);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
    throttledIncrement();
  };

  const reset = () => {
    setClickCount(0);
    setThrottledCount(0);
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useThrottle
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Limit function execution to at most once per specified interval
      </Text>

      <View style={styles.throttleContainer}>
        <View style={styles.throttleStats}>
          <Text style={[styles.statText, isDarkMode && styles.darkText]}>
            Total Clicks: {clickCount}
          </Text>
          <Text style={[styles.statText, isDarkMode && styles.darkText]}>
            Throttled: {throttledCount}
          </Text>
          <Text style={[styles.statText, isDarkMode && styles.darkDescription]}>
            Limit: {limit}ms
          </Text>
        </View>

        <TextInput
          style={[
            styles.input,
            styles.smallInput,
            isDarkMode && styles.darkInput,
          ]}
          placeholder="Throttle limit (ms)"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={limit.toString()}
          onChangeText={text => setLimit(parseInt(text, 10) || 1000)}
          keyboardType="numeric"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={handleClick}>
            <Text style={styles.buttonText}>Click Me Fast! 🚀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={reset}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[styles.throttleInfo, isDarkMode && styles.darkDescription]}
        >
          Try clicking rapidly! Throttling limits execution to once per {limit}
          ms.
        </Text>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Scroll handlers, button clicks, API rate limiting,
        animations
      </Text>
    </View>
  );
};

const RandomIntervalDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [minDelay, setMinDelay] = useState(1000);
  const [maxDelay, setMaxDelay] = useState(3000);

  const funMessages = [
    '🎉 Random message!',
    '🚀 Another one!',
    '⭐ Surprise!',
    '🎯 Got you!',
    '🌟 Random timing!',
    '🎊 Unpredictable!',
  ];

  useRandomInterval(
    () => {
      const randomMessage =
        funMessages[Math.floor(Math.random() * funMessages.length)];
      setMessages(prev => [...prev.slice(-4), randomMessage]); // Keep last 5
    },
    isActive ? minDelay : null,
    isActive ? maxDelay : null,
  );

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useRandomInterval
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Execute function at random intervals between min and max delays
      </Text>

      <View style={styles.randomIntervalContainer}>
        <View style={styles.delayInputs}>
          <View style={styles.delayInput}>
            <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
              Min (ms)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.smallInput,
                isDarkMode && styles.darkInput,
              ]}
              value={minDelay.toString()}
              onChangeText={text => setMinDelay(parseInt(text, 10) || 1000)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.delayInput}>
            <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
              Max (ms)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.smallInput,
                isDarkMode && styles.darkInput,
              ]}
              value={maxDelay.toString()}
              onChangeText={text => setMaxDelay(parseInt(text, 10) || 3000)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, isActive && styles.stopButton]}
            onPress={() => setIsActive(!isActive)}
          >
            <Text style={styles.buttonText}>{isActive ? 'Stop' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setMessages([])}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.messagesContainer}>
          {messages.map((message, index) => (
            <Text
              key={index}
              style={[styles.messageItem, isDarkMode && styles.darkText]}
            >
              {message}
            </Text>
          ))}
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Animations, game events, notifications, simulating human
        behavior
      </Text>
    </View>
  );
};

const IntervalWhenDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [count, setCount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const [condition, setCondition] = useState(true);
  const [delay, setDelay] = useState(1000);

  useIntervalWhen(
    () => {
      setCount(prev => prev + 1);
    },
    delay,
    isEnabled && condition,
  );

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useIntervalWhen
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Conditional intervals that start/stop based on conditions
      </Text>

      <View style={styles.intervalWhenContainer}>
        <Text style={[styles.timerValue, isDarkMode && styles.darkText]}>
          Count: {count}
        </Text>

        <View style={styles.conditionsContainer}>
          <View style={styles.conditionRow}>
            <Text
              style={[styles.conditionLabel, isDarkMode && styles.darkText]}
            >
              Enabled:
            </Text>
            <TouchableOpacity
              style={[styles.toggleButton, isEnabled && styles.activeToggle]}
              onPress={() => setIsEnabled(!isEnabled)}
            >
              <Text
                style={[
                  styles.toggleText,
                  isEnabled && styles.activeToggleText,
                ]}
              >
                {isEnabled ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.conditionRow}>
            <Text
              style={[styles.conditionLabel, isDarkMode && styles.darkText]}
            >
              Condition:
            </Text>
            <TouchableOpacity
              style={[styles.toggleButton, condition && styles.activeToggle]}
              onPress={() => setCondition(!condition)}
            >
              <Text
                style={[
                  styles.toggleText,
                  condition && styles.activeToggleText,
                ]}
              >
                {condition ? 'TRUE' : 'FALSE'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={[
            styles.input,
            styles.smallInput,
            isDarkMode && styles.darkInput,
          ]}
          placeholder="Interval (ms)"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={delay.toString()}
          onChangeText={text => setDelay(parseInt(text, 10) || 1000)}
          keyboardType="numeric"
        />

        <Text style={[styles.statusText, isDarkMode && styles.darkDescription]}>
          Status: {isEnabled && condition ? 'Running' : 'Stopped'}
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setCount(0)}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Reset Count
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Conditional polling, user activity monitoring, game loops
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  demoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  demoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  demoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  useCase: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 12,
    lineHeight: 18,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  timerInfo: {
    fontSize: 14,
    color: '#666',
  },
  controlsContainer: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  smallInput: {
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#666',
  },
  secondaryButtonText: {
    color: '#fff',
  },
  stopButton: {
    backgroundColor: '#d32f2f',
  },
  timeoutContainer: {
    alignItems: 'center',
  },
  messageContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
  },
  countdownDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  countdownUnit: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 70,
  },
  countdownNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  countdownLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  finishedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 12,
  },
  debounceContainer: {
    marginBottom: 8,
  },
  debounceInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  debounceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  searchResults: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  resultItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  throttleContainer: {
    alignItems: 'center',
  },
  throttleStats: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  throttleInfo: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  randomIntervalContainer: {
    marginBottom: 8,
  },
  delayInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  delayInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  messagesContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    minHeight: 60,
  },
  messageItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  intervalWhenContainer: {
    alignItems: 'center',
  },
  conditionsContainer: {
    width: '100%',
    marginBottom: 12,
  },
  conditionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  toggleButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#4caf50',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#fff',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  darkText: {
    color: '#fff',
  },
  darkDescription: {
    color: '#888',
  },
});

export default TimingHooksScreen;
