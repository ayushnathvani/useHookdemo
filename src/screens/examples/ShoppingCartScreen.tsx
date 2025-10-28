import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  Image,
  Modal,
} from 'react-native';
import {
  useList,
  useToggle,
  useCounter,
  useDebounce,
  usePrevious,
} from '@uidotdev/usehooks';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  discount?: number;
}

interface CartItem extends Product {
  quantity: number;
  addedAt: number;
}

interface ShippingInfo {
  method: 'standard' | 'express' | 'overnight';
  cost: number;
  estimatedDays: string;
}

const ShoppingCartScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';

  // Product catalog
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'iPhone 15 Pro',
      price: 999,
      category: 'Electronics',
      description: 'Latest iPhone with A17 Pro chip and titanium design',
      image: '📱',
      rating: 4.8,
      reviews: 1250,
      inStock: true,
      discount: 10,
    },
    {
      id: '2',
      name: 'MacBook Pro 16"',
      price: 2499,
      category: 'Electronics',
      description: 'Powerful laptop for professionals with M3 Max chip',
      image: '💻',
      rating: 4.9,
      reviews: 890,
      inStock: true,
    },
    {
      id: '3',
      name: 'AirPods Pro',
      price: 249,
      category: 'Audio',
      description: 'Wireless earbuds with active noise cancellation',
      image: '🎧',
      rating: 4.7,
      reviews: 2340,
      inStock: false,
    },
    {
      id: '4',
      name: 'Apple Watch Ultra',
      price: 799,
      category: 'Wearables',
      description: 'Most rugged Apple Watch for extreme adventures',
      image: '⌚',
      rating: 4.6,
      reviews: 567,
      inStock: true,
      discount: 5,
    },
    {
      id: '5',
      name: 'iPad Pro 12.9"',
      price: 1099,
      category: 'Tablets',
      description: 'Ultimate iPad experience with M2 chip',
      image: '📱',
      rating: 4.8,
      reviews: 1120,
      inStock: true,
    },
  ]);

  // Cart management with useList
  const [
    cartItems,
    {
      push: addToCart,
      removeAt: removeFromCart,
      set: setCartItems,
      clear: clearCart,
    },
  ] = useList<CartItem>([]);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  const [isCartVisible, toggleCartVisibility] = useToggle(false);
  const [isCheckoutVisible, toggleCheckoutVisibility] = useToggle(false);

  // Search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Checkout state
  const [shippingMethod, setShippingMethod] = useState<ShippingInfo>({
    method: 'standard',
    cost: 0,
    estimatedDays: '5-7',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  // Statistics
  const cartItemCount = cartItems.length;
  const [itemsAdded, { increment: incrementItemsAdded }] = useCounter(0);
  const previousCartCount = usePrevious(cartItemCount);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const discountedPrice = item.discount
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return sum + discountedPrice * item.quantity;
  }, 0);

  const couponDiscount = appliedCoupon
    ? (subtotal * appliedCoupon.discount) / 100
    : 0;
  const taxRate = 0.08; // 8% tax
  const tax = (subtotal - couponDiscount) * taxRate;
  const total = subtotal - couponDiscount + tax + shippingMethod.cost;

  // Categories
  const categories = [
    'All',
    ...Array.from(new Set(products.map(p => p.category))),
  ];

  // Filter and sort products
  const filteredProducts = useCallback(() => {
    let filtered = products.filter(product => {
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }

      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, selectedCategory, debouncedSearch, sortBy]);

  // Track cart changes for analytics
  useEffect(() => {
    if (previousCartCount !== undefined && cartItemCount > previousCartCount) {
      incrementItemsAdded();
    }
  }, [cartItemCount, previousCartCount, incrementItemsAdded]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      if (!product.inStock) {
        Alert.alert('Out of Stock', 'This item is currently out of stock');
        return;
      }

      const existingIndex = cartItems.findIndex(item => item.id === product.id);

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const updatedCart = [...cartItems];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1,
        };
        setCartItems(updatedCart);
      } else {
        // Add new item to cart
        const cartItem: CartItem = {
          ...product,
          quantity: 1,
          addedAt: Date.now(),
        };
        addToCart(cartItem);
      }

      Alert.alert('Added to Cart', `${product.name} added to your cart!`);
    },
    [cartItems, addToCart, setCartItems],
  );

  const updateCartItemQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        const itemIndex = cartItems.findIndex(item => item.id === itemId);
        if (itemIndex >= 0) {
          removeFromCart(itemIndex);
        }
      } else {
        const updatedCart = cartItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        );
        setCartItems(updatedCart);
      }
    },
    [cartItems, setCartItems, removeFromCart],
  );

  const applyCoupon = useCallback(() => {
    const validCoupons = {
      SAVE10: { discount: 10, minAmount: 100 },
      SAVE20: { discount: 20, minAmount: 500 },
      WELCOME: { discount: 15, minAmount: 200 },
    };

    const coupon =
      validCoupons[couponCode.toUpperCase() as keyof typeof validCoupons];

    if (!coupon) {
      Alert.alert('Invalid Coupon', 'The coupon code you entered is not valid');
      return;
    }

    if (subtotal < coupon.minAmount) {
      Alert.alert(
        'Minimum Amount',
        `This coupon requires a minimum order of $${coupon.minAmount}`,
      );
      return;
    }

    setAppliedCoupon({
      code: couponCode.toUpperCase(),
      discount: coupon.discount,
    });
    Alert.alert(
      'Coupon Applied!',
      `You saved ${coupon.discount}% on your order!`,
    );
  }, [couponCode, subtotal]);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      Alert.alert(
        'Empty Cart',
        'Please add items to your cart before checking out',
      );
      return;
    }

    Alert.alert(
      'Order Placed!',
      `Your order of $${total.toFixed(
        2,
      )} has been placed successfully. You'll receive a confirmation email shortly.`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => {
            clearCart();
            setAppliedCoupon(null);
            setCouponCode('');
            toggleCheckoutVisibility();
            toggleCartVisibility();
          },
        },
      ],
    );
  }, [
    cartItems,
    total,
    clearCart,
    toggleCheckoutVisibility,
    toggleCartVisibility,
  ]);

  const getDiscountedPrice = (product: Product) => {
    return product.discount
      ? product.price * (1 - product.discount / 100)
      : product.price;
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Smart Shopping Cart
        </Text>

        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, isDarkMode && styles.darkText]}>
              {cartItemCount}
            </Text>
            <Text
              style={[styles.statLabel, isDarkMode && styles.darkDescription]}
            >
              In Cart
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#4caf50' }]}>
              ${subtotal.toFixed(0)}
            </Text>
            <Text
              style={[styles.statLabel, isDarkMode && styles.darkDescription]}
            >
              Subtotal
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#1976d2' }]}>
              {itemsAdded}
            </Text>
            <Text
              style={[styles.statLabel, isDarkMode && styles.darkDescription]}
            >
              Added
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.cartButton,
            cartItemCount > 0 && styles.cartButtonActive,
          ]}
          onPress={() => toggleCartVisibility()}
        >
          <Text style={styles.cartButtonText}>
            🛒 View Cart ({cartItemCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={[styles.filtersContainer, isDarkMode && styles.darkCard]}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkInput]}
          placeholder="Search products..."
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sortContainer}>
          <Text style={[styles.sortLabel, isDarkMode && styles.darkText]}>
            Sort by:
          </Text>
          {(['name', 'price', 'rating'] as const).map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortButton,
                sortBy === option && styles.selectedSortButton,
              ]}
              onPress={() => setSortBy(option)}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === option && styles.selectedSortText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Product List */}
      <ScrollView style={styles.productList}>
        {filteredProducts().map(product => (
          <View
            key={product.id}
            style={[styles.productCard, isDarkMode && styles.darkProductCard]}
          >
            <View style={styles.productHeader}>
              <Text style={styles.productImage}>{product.image}</Text>
              <View style={styles.productInfo}>
                <Text
                  style={[styles.productName, isDarkMode && styles.darkText]}
                >
                  {product.name}
                </Text>
                <Text
                  style={[
                    styles.productDescription,
                    isDarkMode && styles.darkDescription,
                  ]}
                >
                  {product.description}
                </Text>

                <View style={styles.productMeta}>
                  <Text style={styles.rating}>⭐ {product.rating}</Text>
                  <Text
                    style={[
                      styles.reviews,
                      isDarkMode && styles.darkDescription,
                    ]}
                  >
                    ({product.reviews} reviews)
                  </Text>
                  <Text
                    style={[
                      styles.category,
                      isDarkMode && styles.darkDescription,
                    ]}
                  >
                    {product.category}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.productFooter}>
              <View style={styles.priceContainer}>
                {product.discount && (
                  <Text style={styles.originalPrice}>${product.price}</Text>
                )}
                <Text style={[styles.price, isDarkMode && styles.darkText]}>
                  ${getDiscountedPrice(product).toFixed(0)}
                </Text>
                {product.discount && (
                  <Text style={styles.discount}>-{product.discount}%</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  !product.inStock && styles.outOfStockButton,
                ]}
                onPress={() => handleAddToCart(product)}
                disabled={!product.inStock}
              >
                <Text style={styles.addToCartButtonText}>
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Cart Modal */}
      <Modal
        visible={isCartVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => toggleCartVisibility()}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.cartModal, isDarkMode && styles.darkCard]}>
            <View style={styles.cartHeader}>
              <Text style={[styles.cartTitle, isDarkMode && styles.darkText]}>
                Shopping Cart ({cartItemCount} items)
              </Text>
              <TouchableOpacity onPress={() => toggleCartVisibility()}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cartItems}>
              {cartItems.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.cartItem, isDarkMode && styles.darkCartItem]}
                >
                  <Text style={styles.cartItemImage}>{item.image}</Text>
                  <View style={styles.cartItemInfo}>
                    <Text
                      style={[
                        styles.cartItemName,
                        isDarkMode && styles.darkText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.cartItemPrice,
                        isDarkMode && styles.darkDescription,
                      ]}
                    >
                      ${getDiscountedPrice(item).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        updateCartItemQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text
                      style={[styles.quantity, isDarkMode && styles.darkText]}
                    >
                      {item.quantity}
                    </Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        updateCartItemQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.cartSummary}>
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, isDarkMode && styles.darkText]}
                >
                  Subtotal:
                </Text>
                <Text
                  style={[styles.summaryValue, isDarkMode && styles.darkText]}
                >
                  ${subtotal.toFixed(2)}
                </Text>
              </View>

              {appliedCoupon && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#4caf50' }]}>
                    Coupon ({appliedCoupon.code}):
                  </Text>
                  <Text style={styles.discountValue}>
                    -${couponDiscount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.cartActions}>
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={() => {
                    toggleCartVisibility();
                    toggleCheckoutVisibility();
                  }}
                  disabled={cartItems.length === 0}
                >
                  <Text style={styles.checkoutButtonText}>
                    Proceed to Checkout ($
                    {(subtotal - couponDiscount).toFixed(2)})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Checkout Modal */}
      <Modal
        visible={isCheckoutVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => toggleCheckoutVisibility()}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.checkoutModal, isDarkMode && styles.darkCard]}>
            <Text style={[styles.checkoutTitle, isDarkMode && styles.darkText]}>
              Checkout
            </Text>

            {/* Coupon Section */}
            <View style={styles.couponSection}>
              <Text
                style={[styles.sectionTitle, isDarkMode && styles.darkText]}
              >
                Promo Code
              </Text>
              <View style={styles.couponRow}>
                <TextInput
                  style={[styles.couponInput, isDarkMode && styles.darkInput]}
                  placeholder="Enter coupon code"
                  placeholderTextColor={isDarkMode ? '#888' : '#666'}
                  value={couponCode}
                  onChangeText={setCouponCode}
                />
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={applyCoupon}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Shipping Section */}
            <View style={styles.shippingSection}>
              <Text
                style={[styles.sectionTitle, isDarkMode && styles.darkText]}
              >
                Shipping Method
              </Text>
              {[
                { method: 'standard' as const, cost: 0, days: '5-7' },
                { method: 'express' as const, cost: 15, days: '2-3' },
                { method: 'overnight' as const, cost: 35, days: '1' },
              ].map(option => (
                <TouchableOpacity
                  key={option.method}
                  style={[
                    styles.shippingOption,
                    shippingMethod.method === option.method &&
                      styles.selectedShippingOption,
                  ]}
                  onPress={() =>
                    setShippingMethod({
                      method: option.method,
                      cost: option.cost,
                      estimatedDays: option.days,
                    })
                  }
                >
                  <Text
                    style={[styles.shippingText, isDarkMode && styles.darkText]}
                  >
                    {option.method.charAt(0).toUpperCase() +
                      option.method.slice(1)}{' '}
                    -{option.cost === 0 ? ' Free' : ` $${option.cost}`}(
                    {option.days} days)
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Order Summary */}
            <View style={styles.orderSummary}>
              <Text
                style={[styles.sectionTitle, isDarkMode && styles.darkText]}
              >
                Order Summary
              </Text>

              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, isDarkMode && styles.darkText]}
                >
                  Subtotal:
                </Text>
                <Text
                  style={[styles.summaryValue, isDarkMode && styles.darkText]}
                >
                  ${subtotal.toFixed(2)}
                </Text>
              </View>

              {appliedCoupon && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#4caf50' }]}>
                    Discount ({appliedCoupon.code}):
                  </Text>
                  <Text style={styles.discountValue}>
                    -${couponDiscount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, isDarkMode && styles.darkText]}
                >
                  Shipping:
                </Text>
                <Text
                  style={[styles.summaryValue, isDarkMode && styles.darkText]}
                >
                  ${shippingMethod.cost.toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, isDarkMode && styles.darkText]}
                >
                  Tax:
                </Text>
                <Text
                  style={[styles.summaryValue, isDarkMode && styles.darkText]}
                >
                  ${tax.toFixed(2)}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text
                  style={[styles.totalLabel, isDarkMode && styles.darkText]}
                >
                  Total:
                </Text>
                <Text
                  style={[styles.totalValue, isDarkMode && styles.darkText]}
                >
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.checkoutActions}>
              <TouchableOpacity
                style={styles.cancelCheckoutButton}
                onPress={() => toggleCheckoutVisibility()}
              >
                <Text style={styles.cancelCheckoutButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.placeOrderButton}
                onPress={handleCheckout}
              >
                <Text style={styles.placeOrderButtonText}>
                  Place Order - ${total.toFixed(2)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 10,
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  cartButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cartButtonActive: {
    backgroundColor: '#1976d2',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  categoryFilter: {
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedCategoryButton: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    backgroundColor: '#f0f0f0',
  },
  selectedSortButton: {
    backgroundColor: '#1976d2',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
  },
  selectedSortText: {
    color: '#fff',
  },
  productList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkProductCard: {
    backgroundColor: '#2a2a2a',
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    fontSize: 40,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#ff9800',
    marginRight: 8,
  },
  reviews: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  category: {
    fontSize: 12,
    color: '#666',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  discount: {
    fontSize: 12,
    color: '#f44336',
    backgroundColor: '#ffebee',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addToCartButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  outOfStockButton: {
    backgroundColor: '#ccc',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartModal: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
    minWidth: 300,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  cartItems: {
    flex: 1,
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  darkCartItem: {
    borderBottomColor: '#444',
  },
  cartItemImage: {
    fontSize: 24,
    marginRight: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cartSummary: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: '600',
  },
  cartActions: {
    marginTop: 16,
  },
  checkoutButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutModal: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    minWidth: 300,
  },
  checkoutTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  couponSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  shippingSection: {
    marginBottom: 20,
  },
  shippingOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedShippingOption: {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
  shippingText: {
    fontSize: 14,
    color: '#333',
  },
  orderSummary: {
    marginBottom: 20,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelCheckoutButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.4,
    alignItems: 'center',
  },
  cancelCheckoutButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  placeOrderButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.55,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
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

export default ShoppingCartScreen;
