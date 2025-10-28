import React, { useState, useEffect, useCallback } from 'react';
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
  useCounter,
  useToggle,
  useList,
  useDebounce,
  usePrevious,
} from '@uidotdev/usehooks';

const mockSearchData = [
  'Apple iPhone 15 Pro',
  'Samsung Galaxy S24',
  'Google Pixel 8',
  'OnePlus 12',
  'Xiaomi 14',
  'Sony Xperia 1 V',
  'Nothing Phone (2)',
  'Motorola Edge 50',
  'Oppo Find X7',
  'Vivo X100',
];

const ExamplesScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <ShoppingCartExample isDarkMode={isDarkMode} />
      <SearchExample isDarkMode={isDarkMode} />
      <FormExample isDarkMode={isDarkMode} />
      <ChatExample isDarkMode={isDarkMode} />
      <GameScoreExample isDarkMode={isDarkMode} />
    </ScrollView>
  );
};

const ShoppingCartExample = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [cartItems, { push: addItem, removeAt, clear: clearCart }] = useList<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>([]);

  const [itemCounts, setItemCounts] = useState<{ [key: string]: number }>({});

  const products = [
    { id: 1, name: 'iPhone 15', price: 999 },
    { id: 2, name: 'MacBook Pro', price: 2499 },
    { id: 3, name: 'AirPods Pro', price: 249 },
    { id: 4, name: 'iPad Air', price: 599 },
    { id: 5, name: 'Apple Watch', price: 399 },
  ];

  const addToCart = (product: (typeof products)[0]) => {
    const existingIndex = cartItems.findIndex(item => item.id === product.id);
    if (existingIndex >= 0) {
      // Update quantity of existing item
      const updatedItems = [...cartItems];
      updatedItems[existingIndex].quantity += 1;
      // Since useList doesn't have update method, we'll remove and add
      removeAt(existingIndex);
      addItem(updatedItems[existingIndex]);
    } else {
      addItem({ ...product, quantity: 1 });
    }
    setItemCounts(prev => ({
      ...prev,
      [product.name]: (prev[product.name] || 0) + 1,
    }));
  };

  const removeFromCart = (index: number) => {
    const item = cartItems[index];
    setItemCounts(prev => ({
      ...prev,
      [item.name]: Math.max(0, (prev[item.name] || 0) - 1),
    }));
    removeAt(index);
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={[styles.exampleCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.exampleTitle, isDarkMode && styles.darkText]}>
        🛒 Shopping Cart
      </Text>
      <Text
        style={[
          styles.exampleDescription,
          isDarkMode && styles.darkDescription,
        ]}
      >
        Demonstrates useList, useCounter patterns for e-commerce
      </Text>

      <View style={styles.productsSection}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Products
        </Text>
        {products.map(product => (
          <View key={product.id} style={styles.productItem}>
            <View style={styles.productInfo}>
              <Text style={[styles.productName, isDarkMode && styles.darkText]}>
                {product.name}
              </Text>
              <Text
                style={[
                  styles.productPrice,
                  isDarkMode && styles.darkDescription,
                ]}
              >
                ${product.price}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(product)}
            >
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
            {itemCounts[product.name] > 0 && (
              <Text style={[styles.itemCount, isDarkMode && styles.darkText]}>
                ({itemCounts[product.name]})
              </Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.cartSection}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Cart ({totalItems} items)
        </Text>

        {cartItems.length === 0 ? (
          <Text
            style={[styles.emptyCart, isDarkMode && styles.darkDescription]}
          >
            Cart is empty
          </Text>
        ) : (
          <>
            {cartItems.map((item, index) => (
              <View key={`${item.id}-${index}`} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text
                    style={[styles.cartItemName, isDarkMode && styles.darkText]}
                  >
                    {item.name} × {item.quantity}
                  </Text>
                  <Text
                    style={[
                      styles.cartItemPrice,
                      isDarkMode && styles.darkDescription,
                    ]}
                  >
                    ${item.price * item.quantity}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromCart(index)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.cartTotal}>
              <Text style={[styles.totalText, isDarkMode && styles.darkText]}>
                Total: ${totalPrice}
              </Text>
            </View>

            <View style={styles.cartActions}>
              <TouchableOpacity style={styles.checkoutButton}>
                <Text style={styles.checkoutButtonText}>Checkout</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                <Text style={styles.clearButtonText}>Clear Cart</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const SearchExample = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedQuery) {
      setIsSearching(true);
      // Simulate API call
      setTimeout(() => {
        const filteredResults = mockSearchData.filter(item =>
          item.toLowerCase().includes(debouncedQuery.toLowerCase()),
        );
        setResults(filteredResults);
        setIsSearching(false);
      }, 300);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [debouncedQuery]);

  return (
    <View style={[styles.exampleCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.exampleTitle, isDarkMode && styles.darkText]}>
        🔍 Live Search
      </Text>
      <Text
        style={[
          styles.exampleDescription,
          isDarkMode && styles.darkDescription,
        ]}
      >
        Demonstrates useDebounce for efficient search with API calls
      </Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkInput]}
          placeholder="Search for phones..."
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.searchMeta}>
          <Text
            style={[styles.searchInfo, isDarkMode && styles.darkDescription]}
          >
            Query: "{searchQuery}" | Debounced: "{debouncedQuery}"
          </Text>
          {isSearching && (
            <Text
              style={[
                styles.searchStatus,
                isDarkMode && styles.darkDescription,
              ]}
            >
              🔄 Searching...
            </Text>
          )}
        </View>

        {results.length > 0 && (
          <View style={styles.searchResults}>
            <Text style={[styles.resultsTitle, isDarkMode && styles.darkText]}>
              Results ({results.length}):
            </Text>
            {results.map((result, index) => (
              <TouchableOpacity key={index} style={styles.resultItem}>
                <Text
                  style={[styles.resultText, isDarkMode && styles.darkText]}
                >
                  📱 {result}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {debouncedQuery && results.length === 0 && !isSearching && (
          <Text
            style={[styles.noResults, isDarkMode && styles.darkDescription]}
          >
            No results found for "{debouncedQuery}"
          </Text>
        )}
      </View>
    </View>
  );
};

const FormExample = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    newsletter: false,
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const previousFormData = usePrevious(formData);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 13) {
      newErrors.age = 'Must be 13 or older';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setIsSubmitted(true);
      Alert.alert('Success!', 'Form submitted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      age: '',
      newsletter: false,
    });
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <View style={[styles.exampleCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.exampleTitle, isDarkMode && styles.darkText]}>
        📝 Smart Form
      </Text>
      <Text
        style={[
          styles.exampleDescription,
          isDarkMode && styles.darkDescription,
        ]}
      >
        Demonstrates useObjectState, usePrevious for form handling
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, isDarkMode && styles.darkText]}>
            Name
          </Text>
          <TextInput
            style={[
              styles.formInput,
              isDarkMode && styles.darkInput,
              errors.name && styles.errorInput,
            ]}
            value={formData.name}
            onChangeText={name => updateFormData({ name })}
            placeholder="Enter your name"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, isDarkMode && styles.darkText]}>
            Email
          </Text>
          <TextInput
            style={[
              styles.formInput,
              isDarkMode && styles.darkInput,
              errors.email && styles.errorInput,
            ]}
            value={formData.email}
            onChangeText={email => updateFormData({ email })}
            placeholder="Enter your email"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, isDarkMode && styles.darkText]}>
            Age
          </Text>
          <TextInput
            style={[
              styles.formInput,
              isDarkMode && styles.darkInput,
              errors.age && styles.errorInput,
            ]}
            value={formData.age}
            onChangeText={age => updateFormData({ age })}
            placeholder="Enter your age"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            keyboardType="numeric"
          />
          {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => updateFormData({ newsletter: !formData.newsletter })}
        >
          <View
            style={[
              styles.checkbox,
              formData.newsletter && styles.checkboxChecked,
            ]}
          >
            {formData.newsletter && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.checkboxLabel, isDarkMode && styles.darkText]}>
            Subscribe to newsletter
          </Text>
        </TouchableOpacity>

        {previousFormData && (
          <View style={styles.changesInfo}>
            <Text style={[styles.changesTitle, isDarkMode && styles.darkText]}>
              Recent Changes:
            </Text>
            {Object.keys(formData).map(key => {
              const currentValue = formData[key as keyof typeof formData];
              const previousValue =
                previousFormData[key as keyof typeof previousFormData];
              if (currentValue !== previousValue) {
                return (
                  <Text
                    key={key}
                    style={[
                      styles.changeItem,
                      isDarkMode && styles.darkDescription,
                    ]}
                  >
                    {key}: "{String(previousValue)}" → "{String(currentValue)}"
                  </Text>
                );
              }
              return null;
            })}
          </View>
        )}

        <View style={styles.formActions}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {isSubmitted && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>
              ✅ Form submitted successfully!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const ChatExample = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [messages, { push: addMessage, clear: clearMessages }] = useList<{
    id: number;
    text: string;
    timestamp: number;
    sender: 'user' | 'bot';
  }>([
    {
      id: 1,
      text: 'Hello! How can I help you today?',
      timestamp: Date.now() - 10000,
      sender: 'bot',
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useToggle(false);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      timestamp: Date.now(),
      sender: 'user' as const,
    };

    addMessage(userMessage);
    setNewMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "That's interesting! Tell me more.",
        'I understand. How can I help with that?',
        'Great question! Let me think about that.',
        'Thanks for sharing that information.',
        "I see what you mean. Here's what I think...",
      ];

      const botMessage = {
        id: Date.now() + 1,
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        timestamp: Date.now(),
        sender: 'bot' as const,
      };

      addMessage(botMessage);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <View style={[styles.exampleCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.exampleTitle, isDarkMode && styles.darkText]}>
        💬 Live Chat
      </Text>
      <Text
        style={[
          styles.exampleDescription,
          isDarkMode && styles.darkDescription,
        ]}
      >
        Demonstrates useList, useToggle for real-time messaging
      </Text>

      <View style={styles.chatContainer}>
        <View style={styles.messagesContainer}>
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageItem,
                message.sender === 'user'
                  ? styles.userMessage
                  : styles.botMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user'
                    ? styles.userMessageText
                    : styles.botMessageText,
                ]}
              >
                {message.text}
              </Text>
              <Text style={styles.messageTime}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))}

          {isTyping && (
            <View
              style={[
                styles.messageItem,
                styles.botMessage,
                styles.typingMessage,
              ]}
            >
              <Text style={styles.botMessageText}>Bot is typing...</Text>
            </View>
          )}
        </View>

        <View style={styles.messageInput}>
          <TextInput
            style={[styles.chatInput, isDarkMode && styles.darkInput]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.clearChatButton}
          onPress={clearMessages}
        >
          <Text style={styles.clearChatButtonText}>Clear Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const GameScoreExample = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [score, { increment: incrementScore, reset: resetScore }] = useCounter(
    0,
    { min: 0, max: 999999 },
  );
  const [level, { increment: incrementLevel, reset: resetLevel }] = useCounter(
    1,
    { min: 1, max: 100 },
  );
  const [lives, { decrement: loseLife, set: setLives }] = useCounter(3, {
    min: 0,
    max: 5,
  });

  const [gameState, setGameState] = useState({
    isPlaying: false,
    isPaused: false,
    highScore: 0,
    timeElapsed: 0,
  });

  const updateGameState = useCallback((updates: Partial<typeof gameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const previousScore = usePrevious(score);
  const scoreChange = score - (previousScore || 0);

  useEffect(() => {
    if (score > gameState.highScore) {
      updateGameState({ highScore: score });
    }
  }, [score, gameState.highScore, updateGameState]);

  useEffect(() => {
    // Auto level up every 1000 points
    const newLevel = Math.floor(score / 1000) + 1;
    if (newLevel > level && newLevel <= 100) {
      incrementLevel();
    }
  }, [score, level, incrementLevel]);

  const startGame = () => {
    updateGameState({ isPlaying: true, isPaused: false, timeElapsed: 0 });
    resetScore();
    resetLevel();
    setLives(3);
  };

  const pauseGame = () => {
    updateGameState({ isPaused: !gameState.isPaused });
  };

  const endGame = () => {
    updateGameState({ isPlaying: false, isPaused: false });
  };

  const addPoints = (points: number) => {
    for (let i = 0; i < points; i++) {
      incrementScore();
    }
  };

  return (
    <View style={[styles.exampleCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.exampleTitle, isDarkMode && styles.darkText]}>
        🎮 Game Score System
      </Text>
      <Text
        style={[
          styles.exampleDescription,
          isDarkMode && styles.darkDescription,
        ]}
      >
        Demonstrates useCounter, useObjectState, usePrevious for game mechanics
      </Text>

      <View style={styles.gameContainer}>
        <View style={styles.gameHeader}>
          <View style={styles.scoreDisplay}>
            <Text style={[styles.scoreValue, isDarkMode && styles.darkText]}>
              {score}
            </Text>
            <Text
              style={[styles.scoreLabel, isDarkMode && styles.darkDescription]}
            >
              Score
            </Text>
            {scoreChange > 0 && (
              <Text style={styles.scoreChange}>+{scoreChange}</Text>
            )}
          </View>

          <View style={styles.gameStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, isDarkMode && styles.darkText]}>
                Level {level}
              </Text>
              <Text
                style={[styles.statLabel, isDarkMode && styles.darkDescription]}
              >
                Current Level
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, isDarkMode && styles.darkText]}>
                {'❤️'.repeat(lives)}
              </Text>
              <Text
                style={[styles.statLabel, isDarkMode && styles.darkDescription]}
              >
                Lives ({lives})
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, isDarkMode && styles.darkText]}>
                {gameState.highScore}
              </Text>
              <Text
                style={[styles.statLabel, isDarkMode && styles.darkDescription]}
              >
                High Score
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.gameStatus}>
          <Text style={[styles.statusText, isDarkMode && styles.darkText]}>
            Status:{' '}
            {gameState.isPlaying
              ? gameState.isPaused
                ? 'Paused'
                : 'Playing'
              : 'Ready to Start'}
          </Text>
        </View>

        <View style={styles.gameControls}>
          {!gameState.isPlaying ? (
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.pauseButton} onPress={pauseGame}>
                <Text style={styles.pauseButtonText}>
                  {gameState.isPaused ? 'Resume' : 'Pause'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.endButton} onPress={endGame}>
                <Text style={styles.endButtonText}>End Game</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {gameState.isPlaying && !gameState.isPaused && (
          <View style={styles.gameActions}>
            <Text style={[styles.actionsTitle, isDarkMode && styles.darkText]}>
              Game Actions:
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => addPoints(10)}
              >
                <Text style={styles.actionButtonText}>+10 Points</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => addPoints(50)}
              >
                <Text style={styles.actionButtonText}>+50 Points</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => addPoints(100)}
              >
                <Text style={styles.actionButtonText}>+100 Points</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={loseLife}
                disabled={lives === 0}
              >
                <Text style={styles.actionButtonText}>Lose Life</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {lives === 0 && gameState.isPlaying && (
          <View style={styles.gameOver}>
            <Text style={styles.gameOverText}>💀 Game Over!</Text>
            <Text style={[styles.gameOverScore, isDarkMode && styles.darkText]}>
              Final Score: {score}
            </Text>
          </View>
        )}
      </View>
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
  exampleCard: {
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
  exampleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  exampleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },

  // Shopping Cart Styles
  productsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
    minWidth: 30,
  },
  cartSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  emptyCart: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cartTotal: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  cartActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  checkoutButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.6,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.35,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Search Styles
  searchContainer: {
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  searchMeta: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  searchInfo: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  searchStatus: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
    marginTop: 4,
  },
  searchResults: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  resultItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
  noResults: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 12,
    fontStyle: 'italic',
  },

  // Form Styles
  formContainer: {
    marginBottom: 8,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorInput: {
    borderColor: '#f44336',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  changesInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  changesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  changeItem: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#666',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successMessage: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  successText: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '600',
  },

  // Chat Styles
  chatContainer: {
    height: 400,
    marginBottom: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  messageItem: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#1976d2',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    color: '#888',
    textAlign: 'right',
  },
  typingMessage: {
    opacity: 0.7,
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    marginRight: 8,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearChatButton: {
    backgroundColor: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'center',
  },
  clearChatButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Game Styles
  gameContainer: {
    marginBottom: 8,
  },
  gameHeader: {
    marginBottom: 16,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  scoreChange: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
    marginTop: 4,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  gameStatus: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  gameControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pauseButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  endButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  gameActions: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: '22%',
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  gameOver: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 4,
  },
  gameOverScore: {
    fontSize: 16,
    color: '#333',
  },

  // Common styles
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  darkText: {
    color: '#fff',
  },
  darkDescription: {
    color: '#888',
  },
});

export default ExamplesScreen;
