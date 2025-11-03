# 🎣 useHooks.com React Native Implementation Guide

## 📚 **Complete Documentation & Deep Understanding**

This project demonstrates the implementation of popular React hooks from [usehooks.com](https://usehooks.com) in a React Native environment, showcasing both compatible hooks and React Native adaptations of web-only hooks.

---

## 🏗️ **Project Architecture**

```
useHooks/
├── src/
│   ├── screens/
│   │   ├── StateManagementScreen.tsx    # State hooks demos
│   │   ├── TimingHooksScreen.tsx        # Timing & animation hooks  
│   │   ├── UtilityHooksScreen.tsx       # Utility & helper hooks
│   │   ├── InteractionHooksScreen.tsx   # User interaction hooks
│   │   ├── DataFetchingHooksScreen.tsx  # Data & API hooks
│   │   ├── BrowserAPIHooksScreen.tsx    # Browser API adaptations
│   │   └── examples/
│   │       ├── TodoAppScreen.tsx        # Advanced todo app
│   │       ├── ShoppingCartScreen.tsx   # E-commerce demo
│   │       └── SmartFormValidationScreen.tsx # Form validation
│   └── navigation/
└── USEHOOKS_DOCUMENTATION.md           # This file
```

---

## ✅ **Compatible Hooks (Working in React Native)**

### **🔄 State Management Hooks**

#### **1. `useToggle`**
```typescript
const [value, toggle] = useToggle(false);
// toggle() - switches boolean state
// toggle(true) - sets specific value
```

**📝 Deep Understanding:**
- **Purpose:** Simplifies boolean state management
- **Use Cases:** Modal visibility, feature flags, settings toggles
- **Real-world Example:** Dark mode toggle, sidebar visibility, notification preferences

**💡 Implementation Example:**
```typescript
const [isDarkMode, toggleDarkMode] = useToggle(false);
const [showNotifications, toggleNotifications] = useToggle(true);

// Usage in component
<Switch value={isDarkMode} onValueChange={toggleDarkMode} />
```

#### **2. `useCounter`**
```typescript
const [count, { increment, decrement, set, reset }] = useCounter(0);
```

**📝 Deep Understanding:**
- **Purpose:** Manages numeric state with common operations
- **Use Cases:** Like counters, pagination, quantity selectors
- **Real-world Example:** Shopping cart quantities, social media likes, step wizards

**💡 Implementation Example:**
```typescript
const [likes, { increment: addLike, decrement: removeLike }] = useCounter(0);
const [cartItems, { increment: addItem, set: setQuantity }] = useCounter(1);

// Usage
<TouchableOpacity onPress={addLike}>
  <Text>❤️ {likes}</Text>
</TouchableOpacity>
```

#### **3. `useList`**
```typescript
const [list, { push, removeAt, insertAt, updateAt, clear, set }] = useList([]);
```

**📝 Deep Understanding:**
- **Purpose:** Advanced array state management with built-in operations
- **Use Cases:** Todo lists, shopping carts, dynamic forms
- **Real-world Example:** Chat messages, playlist management, user lists

**💡 Implementation Example:**
```typescript
const [todos, { push: addTodo, removeAt: removeTodo }] = useList([]);

const addNewTodo = (text: string) => {
  addTodo({
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: new Date()
  });
};
```

#### **4. `useBoolean`**
```typescript
const [value, { toggle, setTrue, setFalse }] = useBoolean(false);
```

**📝 Deep Understanding:**
- **Purpose:** Boolean state with semantic methods
- **Use Cases:** Loading states, form validation, feature toggles
- **Real-world Example:** API loading, form submission states, error handling

---

### **⏰ Timing & Animation Hooks**

#### **1. `useInterval`**
```typescript
useInterval(() => {
  console.log('Runs every second');
}, 1000);
```

**📝 Deep Understanding:**
- **Purpose:** Declarative intervals that clean up automatically
- **Use Cases:** Auto-refresh data, animations, counters
- **Real-world Example:** Live chat updates, stock price updates, game timers

**💡 Implementation Example:**
```typescript
const [seconds, setSeconds] = useState(0);

useInterval(() => {
  setSeconds(prev => prev + 1);
}, 1000); // Updates every second

// Live data refresh
useInterval(async () => {
  const data = await fetchLatestData();
  setData(data);
}, 30000); // Refresh every 30 seconds
```

#### **2. `useTimeout`**
```typescript
const { start, stop, reset } = useTimeout(() => {
  console.log('Timeout executed');
}, 5000);
```

**📝 Deep Understanding:**
- **Purpose:** Declarative timeouts with control methods
- **Use Cases:** Auto-logout, delayed actions, notifications
- **Real-world Example:** Session timeout, auto-save, toast notifications

#### **3. `useDebounce`**
```typescript
const debouncedValue = useDebounce(searchTerm, 500);
```

**📝 Deep Understanding:**
- **Purpose:** Delays state updates until after a pause in changes
- **Use Cases:** Search autocomplete, API calls, input validation
- **Real-world Example:** Search suggestions, resize handlers, scroll events

**💡 Implementation Example:**
```typescript
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 300);

useEffect(() => {
  if (debouncedSearch) {
    searchAPI(debouncedSearch);
  }
}, [debouncedSearch]);
```

#### **4. `useThrottle`**
```typescript
const throttledValue = useThrottle(value, 1000);
```

**📝 Deep Understanding:**
- **Purpose:** Limits state updates to maximum frequency
- **Use Cases:** Scroll events, button clicks, API rate limiting
- **Real-world Example:** Infinite scroll, rapid button clicks, window resize

---

### **🛠️ Utility Hooks**

#### **1. `usePrevious`**
```typescript
const previousValue = usePrevious(currentValue);
```

**📝 Deep Understanding:**
- **Purpose:** Access previous value of state or props
- **Use Cases:** Animations, comparisons, undo functionality
- **Real-world Example:** Slide transitions, form change detection, analytics

#### **2. `useUpdateEffect`**
```typescript
useUpdateEffect(() => {
  console.log('Runs on updates, not on mount');
}, [dependency]);
```

**📝 Deep Understanding:**
- **Purpose:** useEffect that skips the initial render
- **Use Cases:** Responding to state changes, avoiding initial API calls
- **Real-world Example:** Save form on change, update analytics, refresh data

---

## ❌ **Incompatible Hooks (Web-Only, Need Adaptation)**

### **🌐 Browser API Hooks**

#### **1. `useDocumentTitle` ❌ → `useDocumentTitleRN` ✅**
```typescript
// ❌ Web version (doesn't work in RN)
useDocumentTitle('My Page Title');

// ✅ React Native adaptation
const useDocumentTitleRN = (title: string) => {
  useEffect(() => {
    // In real app: navigation.setOptions({ title })
    console.log('Setting title:', title);
  }, [title]);
};
```

**📝 Why it doesn't work:**
- React Native has no `document` object
- Page titles don't exist in mobile apps

**🔧 React Native Solution:**
- Use navigation library to set screen titles
- Update app state for dynamic headers

#### **2. `useLocalStorage` ❌ → `AsyncStorage` ✅**
```typescript
// ❌ Web version
const [value, setValue] = useLocalStorage('key', 'defaultValue');

// ✅ React Native solution
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAsyncStorage = (key: string, defaultValue: any) => {
  const [value, setValue] = useState(defaultValue);
  
  useEffect(() => {
    AsyncStorage.getItem(key).then(stored => {
      if (stored) setValue(JSON.parse(stored));
    });
  }, [key]);
  
  const setStoredValue = (newValue: any) => {
    setValue(newValue);
    AsyncStorage.setItem(key, JSON.stringify(newValue));
  };
  
  return [value, setStoredValue];
};
```

#### **3. `useWindowSize` ❌ → `Dimensions` ✅**
```typescript
// ❌ Web version
const { width, height } = useWindowSize();

// ✅ React Native adaptation
const useWindowSizeRN = () => {
  const [size, setSize] = useState(() => Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setSize(window);
    });
    return () => subscription?.remove();
  }, []);
  
  return size;
};
```

#### **4. `useNetworkState` ❌ → `@react-native-netinfo/netinfo` ✅**
```typescript
// ❌ Web version
const networkState = useNetworkState();

// ✅ React Native solution
import NetInfo from '@react-native-netinfo/netinfo';

const useNetworkStateRN = () => {
  const [networkState, setNetworkState] = useState(null);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState(state);
    });
    return unsubscribe;
  }, []);
  
  return networkState;
};
```

---

### **🖱️ Interaction Hooks**

#### **1. `useClickAway` ❌ → Modal/Backdrop ✅**
```typescript
// ❌ Web version (DOM events)
const ref = useClickAway(() => {
  setIsOpen(false);
});

// ✅ React Native adaptation
<Modal visible={isOpen} transparent>
  <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
    <View style={styles.backdrop}>
      <TouchableWithoutFeedback>
        <View style={styles.content}>
          {/* Modal content */}
        </View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>
```

#### **2. `useHover` ❌ → PressIn/PressOut ✅**
```typescript
// ❌ Web version (mouse events)
const [hovered, { onMouseEnter, onMouseLeave }] = useHover();

// ✅ React Native adaptation
const [pressed, setPressed] = useState(false);

<TouchableOpacity
  onPressIn={() => setPressed(true)}
  onPressOut={() => setPressed(false)}
  style={[styles.button, pressed && styles.pressed]}
>
  <Text>Press me</Text>
</TouchableOpacity>
```

---

## 🏆 **Real-World Examples**

### **📱 1. Social Media App**

```typescript
// Post engagement system
const PostComponent = ({ post }) => {
  const [liked, toggleLike] = useToggle(post.isLiked);
  const [likes, { increment, decrement }] = useCounter(post.likeCount);
  const [comments, { push: addComment }] = useList(post.comments);

  const handleLike = () => {
    toggleLike();
    liked ? decrement() : increment();
    // API call to update server
    updatePostLike(post.id, !liked);
  };

  return (
    <View>
      <TouchableOpacity onPress={handleLike}>
        <Text>{liked ? '❤️' : '🤍'} {likes}</Text>
      </TouchableOpacity>
      {/* Comments, sharing, etc. */}
    </View>
  );
};
```

### **🛒 2. E-commerce Shopping Cart**

```typescript
const ShoppingCart = () => {
  const [items, { push: addItem, removeAt, updateAt }] = useList([]);
  const [total, setTotal] = useState(0);
  const [isLoading, { setTrue: startLoading, setFalse: stopLoading }] = useBoolean(false);

  // Auto-calculate total when items change
  useUpdateEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [items]);

  // Auto-save cart every 30 seconds
  useInterval(() => {
    if (items.length > 0) {
      saveCartToStorage(items);
    }
  }, 30000);

  const checkout = async () => {
    startLoading();
    try {
      await processPayment(items, total);
      // Clear cart on success
      setItems([]);
    } finally {
      stopLoading();
    }
  };
};
```

### **🔍 3. Advanced Search with Auto-complete**

```typescript
const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, { setTrue: startSearch, setFalse: stopSearch }] = useBoolean(false);
  
  // Debounce search to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery.length > 2) {
      startSearch();
      searchAPI(debouncedQuery)
        .then(setResults)
        .finally(stopSearch);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search..."
      />
      {isSearching && <ActivityIndicator />}
      {results.map(result => (
        <SearchResult key={result.id} item={result} />
      ))}
    </View>
  );
};
```

---

## 📦 **Required React Native Packages**

### **Essential Packages for Hook Adaptations:**

```bash
# Storage
npm install @react-native-async-storage/async-storage

# Network state
npm install @react-native-netinfo/netinfo

# Device information
npm install react-native-device-info

# Localization
npm install react-native-localize

# Navigation (for title management)
npm install @react-navigation/native
```

### **Package.json Dependencies:**
```json
{
  "dependencies": {
    "@uidotdev/usehooks": "^2.4.1",
    "@react-native-async-storage/async-storage": "^1.19.5",
    "@react-native-netinfo/netinfo": "^11.2.1",
    "react-native-device-info": "^10.11.0",
    "react-native-localize": "^3.0.2"
  }
}
```

---

## 🎯 **Best Practices & Patterns**

### **1. Performance Optimization**

```typescript
// ✅ Good: Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// ✅ Good: Debounce rapid state changes
const debouncedSearch = useDebounce(searchTerm, 300);

// ✅ Good: Throttle high-frequency events
const throttledScroll = useThrottle(scrollPosition, 100);
```

### **2. Memory Management**

```typescript
// ✅ Good: Clean up intervals and timeouts
useInterval(() => {
  // Auto-cleanup handled by hook
}, 1000);

// ❌ Bad: Manual interval without cleanup
useEffect(() => {
  const interval = setInterval(() => {
    // This might leak!
  }, 1000);
  // Missing cleanup
}, []);
```

### **3. State Management Patterns**

```typescript
// ✅ Good: Semantic boolean operations
const [isLoading, { setTrue: startLoading, setFalse: stopLoading }] = useBoolean(false);

// ✅ Good: Structured list operations
const [todos, { push: addTodo, removeAt: removeTodo }] = useList([]);

// ✅ Good: Counter with boundaries
const [progress, { increment, reset, set }] = useCounter(0);
```

---

## 🚀 **Migration Guide: Web to React Native**

### **Step 1: Identify Incompatible Hooks**
```typescript
// Check your imports
import {
  useLocalStorage,    // ❌ Needs adaptation
  useWindowSize,      // ❌ Needs adaptation
  useClickAway,       // ❌ Needs adaptation
  useToggle,          // ✅ Works as-is
  useCounter,         // ✅ Works as-is
  useDebounce,        // ✅ Works as-is
} from '@uidotdev/usehooks';
```

### **Step 2: Install React Native Alternatives**
```bash
npm install @react-native-async-storage/async-storage
npm install @react-native-netinfo/netinfo
```

### **Step 3: Create Adaptation Layer**
```typescript
// hooks/adaptations.ts
export { useToggle, useCounter, useDebounce } from '@uidotdev/usehooks';

// Custom adaptations
export const useLocalStorage = useAsyncStorageAdapter;
export const useWindowSize = useWindowSizeRN;
export const useClickAway = useModalBackdrop;
```

### **Step 4: Update Components**
```typescript
// Before (Web)
import { useLocalStorage } from '@uidotdev/usehooks';

// After (React Native)
import { useLocalStorage } from '../hooks/adaptations';
```

---

## 📊 **Performance Metrics**

### **Hook Performance Comparison:**

| Hook | React Native Compatible | Performance Impact | Memory Usage |
|------|------------------------|-------------------|--------------|
| `useToggle` | ✅ Perfect | Minimal | Very Low |
| `useCounter` | ✅ Perfect | Minimal | Very Low |
| `useList` | ✅ Perfect | Low | Medium |
| `useDebounce` | ✅ Perfect | Low | Low |
| `useInterval` | ✅ Perfect | Medium | Low |
| `useLocalStorage` | ❌ Needs Adaptation | Medium | Medium |
| `useWindowSize` | ❌ Needs Adaptation | Low | Low |

---

## 🎨 **UI/UX Patterns**

### **Loading States with useBoolean:**
```typescript
const LoadingButton = ({ onPress, children }) => {
  const [isLoading, { setTrue, setFalse }] = useBoolean(false);

  const handlePress = async () => {
    setTrue();
    try {
      await onPress();
    } finally {
      setFalse();
    }
  };

  return (
    <TouchableOpacity disabled={isLoading} onPress={handlePress}>
      {isLoading ? <ActivityIndicator /> : children}
    </TouchableOpacity>
  );
};
```

### **Pagination with useCounter:**
```typescript
const PaginatedList = ({ data, pageSize = 10 }) => {
  const [page, { increment, decrement, reset }] = useCounter(1);
  
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  return (
    <View>
      <FlatList data={paginatedData} />
      <View style={styles.pagination}>
        <Button title="Previous" onPress={decrement} disabled={page === 1} />
        <Text>Page {page}</Text>
        <Button title="Next" onPress={increment} />
      </View>
    </View>
  );
};
```

---

## 🔍 **Debugging Tips**

### **1. Hook State Logging:**
```typescript
const DebugCounter = () => {
  const [count, actions] = useCounter(0);
  
  // Log state changes
  useUpdateEffect(() => {
    console.log('Counter changed:', count);
  }, [count]);

  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="+" onPress={actions.increment} />
    </View>
  );
};
```

### **2. Performance Monitoring:**
```typescript
const PerformanceTimer = ({ children }) => {
  const [startTime] = useState(Date.now());
  
  useInterval(() => {
    console.log('Component alive for:', Date.now() - startTime, 'ms');
  }, 5000);

  return children;
};
```

---

## 📝 **Conclusion**

This documentation provides a comprehensive understanding of implementing useHooks.com patterns in React Native. The key takeaways are:

### **✅ What Works:**
- **State Management Hooks:** `useToggle`, `useCounter`, `useList`, `useBoolean`
- **Timing Hooks:** `useInterval`, `useTimeout`, `useDebounce`, `useThrottle`  
- **Utility Hooks:** `usePrevious`, `useUpdateEffect`

### **❌ What Needs Adaptation:**
- **Browser API Hooks:** Require React Native alternatives
- **DOM Interaction Hooks:** Need touch-based equivalents
- **Web Storage Hooks:** Use AsyncStorage instead

### **🚀 Best Practices:**
1. **Always clean up:** Use hooks that handle cleanup automatically
2. **Optimize performance:** Use debouncing and throttling appropriately
3. **Adapt thoughtfully:** Don't force web patterns into mobile
4. **Test thoroughly:** Mobile behavior differs from web

This implementation showcases how modern React patterns can be successfully adapted to mobile development while maintaining clean, readable, and performant code.

---

**📚 Additional Resources:**
- [usehooks.com](https://usehooks.com) - Original hook library
- [React Native Documentation](https://reactnative.dev)
- [@uidotdev/usehooks GitHub](https://github.com/uidotdev/usehooks)

---

*Created with ❤️ for the React Native community*