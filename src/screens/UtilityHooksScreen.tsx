import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
} from 'react-native';
import {
  usePrevious,
  useRenderCount,
  useIsFirstRender,
  useDefault,
} from '@uidotdev/usehooks';

// Custom hook for clipboard in React Native
const useClipboard = () => {
  const [copiedText, setCopiedText] = useState<string>('');

  const copyToClipboard = (text: string) => {
    // In a real React Native app, you'd use @react-native-clipboard/clipboard
    setCopiedText(text);
    Alert.alert('Copied!', `"${text}" copied to clipboard`);
  };

  return [copiedText, copyToClipboard] as const;
};

const UtilityHooksScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <PreviousDemo isDarkMode={isDarkMode} />
      <RenderCountDemo isDarkMode={isDarkMode} />
      <FirstRenderDemo isDarkMode={isDarkMode} />
      <CopyToClipboardDemo isDarkMode={isDarkMode} />
      <LoggerDemo isDarkMode={isDarkMode} />
      <DefaultDemo isDarkMode={isDarkMode} />
    </ScrollView>
  );
};

const PreviousDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  const previousCount = usePrevious(count);
  const previousName = usePrevious(name);

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        usePrevious
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Track the previous value of a state or prop
      </Text>

      <View style={styles.previousContainer}>
        <View style={styles.valueGroup}>
          <Text style={[styles.label, isDarkMode && styles.darkText]}>
            Counter
          </Text>
          <View style={styles.valueComparison}>
            <Text style={[styles.currentValue, isDarkMode && styles.darkText]}>
              Current: {count}
            </Text>
            <Text
              style={[
                styles.previousValue,
                isDarkMode && styles.darkDescription,
              ]}
            >
              Previous: {previousCount ?? 'undefined'}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCount(count + 1)}
            >
              <Text style={styles.buttonText}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCount(count - 1)}
            >
              <Text style={styles.buttonText}>-1</Text>
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

        <View style={styles.valueGroup}>
          <Text style={[styles.label, isDarkMode && styles.darkText]}>
            Name
          </Text>
          <View style={styles.valueComparison}>
            <Text style={[styles.currentValue, isDarkMode && styles.darkText]}>
              Current: "{name}"
            </Text>
            <Text
              style={[
                styles.previousValue,
                isDarkMode && styles.darkDescription,
              ]}
            >
              Previous: "{previousName ?? 'undefined'}"
            </Text>
          </View>

          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            value={name}
            onChangeText={setName}
            placeholder="Enter a name"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
          />

          <View style={styles.nameButtons}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => setName('Alice')}
            >
              <Text style={styles.buttonText}>Alice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => setName('Bob')}
            >
              <Text style={styles.buttonText}>Bob</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => setName('Charlie')}
            >
              <Text style={styles.buttonText}>Charlie</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Animations, form validation, undo functionality, comparing
        state changes
      </Text>
    </View>
  );
};

const RenderCountDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const renderCount = useRenderCount();
  const [counter, setCounter] = useState(0);
  const [text, setText] = useState('');
  const [toggle, setToggle] = useState(false);

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useRenderCount
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Track how many times a component has rendered
      </Text>

      <View style={styles.renderDisplay}>
        <Text style={[styles.renderCount, isDarkMode && styles.darkText]}>
          Renders: {renderCount}
        </Text>
        <Text style={[styles.renderInfo, isDarkMode && styles.darkDescription]}>
          Each state update triggers a re-render
        </Text>
      </View>

      <View style={styles.renderTriggers}>
        <View style={styles.triggerGroup}>
          <Text style={[styles.triggerLabel, isDarkMode && styles.darkText]}>
            Counter: {counter}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCounter(counter + 1)}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCounter(counter - 1)}
            >
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.triggerGroup}>
          <Text style={[styles.triggerLabel, isDarkMode && styles.darkText]}>
            Text Input:
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.smallInput,
              isDarkMode && styles.darkInput,
            ]}
            value={text}
            onChangeText={setText}
            placeholder="Type to trigger renders"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
          />
        </View>

        <View style={styles.triggerGroup}>
          <Text style={[styles.triggerLabel, isDarkMode && styles.darkText]}>
            Toggle: {toggle ? 'ON' : 'OFF'}
          </Text>
          <TouchableOpacity
            style={[styles.toggleButton, toggle && styles.toggleActive]}
            onPress={() => setToggle(!toggle)}
          >
            <Text
              style={[styles.toggleText, toggle && styles.toggleActiveText]}
            >
              Toggle
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Performance debugging, optimization analysis, render
        tracking
      </Text>
    </View>
  );
};

const FirstRenderDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const isFirstRender = useIsFirstRender();
  const [counter, setCounter] = useState(0);

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useIsFirstRender
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Determine if the current render is the component's first render
      </Text>

      <View style={styles.firstRenderDisplay}>
        <View
          style={[
            styles.renderStatus,
            isFirstRender ? styles.firstRender : styles.subsequentRender,
          ]}
        >
          <Text style={styles.renderStatusText}>
            {isFirstRender ? '🆕 First Render' : '🔄 Re-render'}
          </Text>
        </View>

        <Text
          style={[
            styles.renderExplanation,
            isDarkMode && styles.darkDescription,
          ]}
        >
          {isFirstRender
            ? 'This is the initial render of the component'
            : 'Component has re-rendered due to state changes'}
        </Text>
      </View>

      <View style={styles.firstRenderControls}>
        <Text style={[styles.counterDisplay, isDarkMode && styles.darkText]}>
          Counter: {counter}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCounter(counter + 1)}
          >
            <Text style={styles.buttonText}>Increment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setCounter(0)}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[styles.firstRenderTip, isDarkMode && styles.darkDescription]}
        >
          💡 Click increment to trigger re-renders and see the status change
        </Text>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Conditional effects, initialization logic, first-render
        animations
      </Text>
    </View>
  );
};

const CopyToClipboardDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [copiedText, copyToClipboard] = useClipboard();
  const [textToCopy, setTextToCopy] = useState('Hello, useHooks!');

  const predefinedTexts = [
    'Hello, World!',
    'React Native is awesome! 🚀',
    'useHooks makes development easier',
    'Copy this to clipboard',
    '🎉 Hooks are powerful!',
  ];

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useCopyToClipboard
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Copy text to clipboard with feedback (Simulated in React Native)
      </Text>

      <View style={styles.clipboardContainer}>
        <TextInput
          style={[
            styles.input,
            styles.clipboardInput,
            isDarkMode && styles.darkInput,
          ]}
          value={textToCopy}
          onChangeText={setTextToCopy}
          placeholder="Enter text to copy"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          multiline
        />

        <TouchableOpacity
          style={styles.copyButton}
          onPress={() => copyToClipboard(textToCopy)}
        >
          <Text style={styles.buttonText}>📋 Copy to Clipboard</Text>
        </TouchableOpacity>

        {copiedText && (
          <View style={styles.copiedFeedback}>
            <Text style={[styles.copiedText, isDarkMode && styles.darkText]}>
              ✅ Copied: "{copiedText}"
            </Text>
          </View>
        )}
      </View>

      <View style={styles.predefinedTexts}>
        <Text style={[styles.predefinedTitle, isDarkMode && styles.darkText]}>
          Quick Copy:
        </Text>
        <View style={styles.textButtons}>
          {predefinedTexts.map((text, index) => (
            <TouchableOpacity
              key={index}
              style={styles.textButton}
              onPress={() => copyToClipboard(text)}
            >
              <Text style={styles.textButtonText}>{text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Share functionality, copy codes/links, text selection tools
      </Text>
    </View>
  );
};

const LoggerDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  // Note: useLogger might not work as expected in React Native
  // We'll create a custom implementation
  const [logs, setLogs] = useState<string[]>([]);
  const [counter, setCounter] = useState(0);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const log = `Render #${renderCount.current} - Counter: ${counter}`;
    setLogs(prev => [...prev.slice(-4), log]); // Keep last 5 logs
  }, [counter]);

  const clearLogs = () => {
    setLogs([]);
    renderCount.current = 0;
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useLogger
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Debug component lifecycle and state changes
      </Text>

      <View style={styles.loggerContainer}>
        <View style={styles.loggerControls}>
          <Text style={[styles.counterDisplay, isDarkMode && styles.darkText]}>
            Counter: {counter}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCounter(counter + 1)}
            >
              <Text style={styles.buttonText}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCounter(counter - 1)}
            >
              <Text style={styles.buttonText}>-1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setCounter(0)}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logsContainer}>
          <Text style={[styles.logsTitle, isDarkMode && styles.darkText]}>
            Render Logs:
          </Text>
          <View style={styles.logsList}>
            {logs.length === 0 ? (
              <Text
                style={[styles.noLogs, isDarkMode && styles.darkDescription]}
              >
                No logs yet. Change the counter to see logs.
              </Text>
            ) : (
              logs.map((log, index) => (
                <Text
                  key={index}
                  style={[styles.logItem, isDarkMode && styles.darkDescription]}
                >
                  {log}
                </Text>
              ))
            )}
          </View>

          {logs.length > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={clearLogs}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Clear Logs
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Development debugging, performance monitoring, state
        tracking
      </Text>
    </View>
  );
};

const DefaultDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [name, setName] = useDefault('', 'Anonymous User');
  const [age, setAge] = useDefault(0, 18);
  const [email, setEmail] = useDefault('', 'user@example.com');

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useDefault
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Provide default values when state is empty or falsy
      </Text>

      <View style={styles.defaultContainer}>
        <View style={styles.defaultField}>
          <Text style={[styles.fieldLabel, isDarkMode && styles.darkText]}>
            Name:
          </Text>
          <Text style={[styles.fieldValue, isDarkMode && styles.darkText]}>
            "{name}" {name === 'Anonymous User' && '(default)'}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.fieldInput,
              isDarkMode && styles.darkInput,
            ]}
            value={name === 'Anonymous User' ? '' : name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
          />
        </View>

        <View style={styles.defaultField}>
          <Text style={[styles.fieldLabel, isDarkMode && styles.darkText]}>
            Age:
          </Text>
          <Text style={[styles.fieldValue, isDarkMode && styles.darkText]}>
            {age} {age === 18 && '(default)'}
          </Text>
          <View style={styles.ageControls}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setAge(age + 1)}
            >
              <Text style={styles.buttonText}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setAge(Math.max(0, age - 1))}
            >
              <Text style={styles.buttonText}>-1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setAge(0)}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.defaultField}>
          <Text style={[styles.fieldLabel, isDarkMode && styles.darkText]}>
            Email:
          </Text>
          <Text style={[styles.fieldValue, isDarkMode && styles.darkText]}>
            "{email}" {email === 'user@example.com' && '(default)'}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.fieldInput,
              isDarkMode && styles.darkInput,
            ]}
            value={email === 'user@example.com' ? '' : email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            keyboardType="email-address"
          />
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        💡 Use case: Form defaults, placeholder values, fallback content, empty
        states
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
  previousContainer: {
    marginBottom: 8,
  },
  valueGroup: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  valueComparison: {
    marginBottom: 12,
  },
  currentValue: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
    marginBottom: 4,
  },
  previousValue: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
    minWidth: 60,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  nameButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  smallButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  renderDisplay: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  renderCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  renderInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  renderTriggers: {
    marginBottom: 8,
  },
  triggerGroup: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  triggerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  smallInput: {
    marginBottom: 0,
  },
  toggleButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  toggleActive: {
    backgroundColor: '#4caf50',
  },
  toggleText: {
    color: '#666',
    fontWeight: '600',
  },
  toggleActiveText: {
    color: '#fff',
  },
  firstRenderDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  renderStatus: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  firstRender: {
    backgroundColor: '#e8f5e8',
  },
  subsequentRender: {
    backgroundColor: '#fff3e0',
  },
  renderStatusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  renderExplanation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  firstRenderControls: {
    alignItems: 'center',
  },
  counterDisplay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  firstRenderTip: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  clipboardContainer: {
    marginBottom: 16,
  },
  clipboardInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  copyButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  copiedFeedback: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  copiedText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '600',
  },
  predefinedTexts: {
    marginBottom: 8,
  },
  predefinedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  textButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  textButtonText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  loggerContainer: {
    marginBottom: 8,
  },
  loggerControls: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  logsList: {
    marginBottom: 12,
  },
  noLogs: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  logItem: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 2,
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  defaultContainer: {
    marginBottom: 8,
  },
  defaultField: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
    marginBottom: 8,
  },
  fieldInput: {
    marginBottom: 0,
  },
  ageControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  darkText: {
    color: '#fff',
  },
  darkDescription: {
    color: '#888',
  },
});

export default UtilityHooksScreen;
