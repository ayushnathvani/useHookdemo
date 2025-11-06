import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  useColorScheme,
} from 'react-native';
import { useAdvancedFetch } from '../../hooks/useAdvancedFetch';

// Mock API URL - We'll create a mock endpoint that returns the expected format
const MOCK_API_URL = 'mock://api/products';

interface Product {
  id: number;
  title: string;
  body: string;
  userId: number;
  // We'll simulate additional product fields
  price?: number;
  category?: string;
  image?: string;
  rating?: number;
}

// Mock fetch function that simulates the expected API response format
const originalFetch = global.fetch;

// Override fetch for our mock endpoint
global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();

  if (url.startsWith('mock://api/products')) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Parse pagination params from URL
    const urlObj = new URL(url.replace('mock://', 'http://'));
    const page = parseInt(urlObj.searchParams.get('page') || '1', 10);
    const limit = parseInt(urlObj.searchParams.get('limit') || '10', 10);

    // Generate mock products
    const totalItems = 50; // Mock total
    const startIndex = (page - 1) * limit;

    const products: Product[] = Array.from({ length: limit }, (_, i) => {
      const id = startIndex + i + 1;
      if (id > totalItems) return null;

      return {
        id,
        title: `Product ${id}`,
        body: `This is the description for product ${id}. It contains detailed information about the features and benefits.`,
        userId: Math.floor(Math.random() * 10) + 1,
        price: Math.floor(Math.random() * 500) + 10,
        category: [
          'Electronics',
          'Clothing',
          'Books',
          'Home & Garden',
          'Sports',
        ][Math.floor(Math.random() * 5)],
        image: `https://picsum.photos/150/150?random=${id}`,
        rating: Math.floor(Math.random() * 5) + 1,
      };
    }).filter(Boolean) as Product[];

    const response = {
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        hasNextPage: startIndex + limit < totalItems,
        hasPreviousPage: page > 1,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fall back to original fetch for other URLs
  return originalFetch(input, init);
};

const AdvancedUseFetchScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [refreshing, setRefreshing] = React.useState(false);

  // Using the actual useAdvancedFetch hook!
  const {
    data: products,
    loading,
    error,
    pagination,
    refresh,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
    fetchPage,
    setLimit,
  } = useAdvancedFetch<Product>(MOCK_API_URL, {
    initialPage: 1,
    initialLimit: 10,
    autoFetch: true,
  });

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={[styles.productCard, isDarkMode && styles.darkCard]}>
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        onError={() => {
          // Handle image load error silently
        }}
      />
      <View style={styles.productInfo}>
        <Text style={[styles.productTitle, isDarkMode && styles.darkText]}>
          {item.title}
        </Text>
        <Text
          style={[
            styles.productDescription,
            isDarkMode && styles.darkDescription,
          ]}
        >
          {item.body}
        </Text>
        <View style={styles.productMeta}>
          <Text style={[styles.productPrice, isDarkMode && styles.darkText]}>
            ${item.price}
          </Text>
          <Text
            style={[
              styles.productCategory,
              isDarkMode && styles.darkDescription,
            ]}
          >
            {item.category}
          </Text>
        </View>
        <View style={styles.productRating}>
          <Text style={styles.ratingStars}>
            {'★'.repeat(item.rating || 0)}
            {'☆'.repeat(5 - (item.rating || 0))}
          </Text>
          <Text
            style={[styles.ratingText, isDarkMode && styles.darkDescription]}
          >
            ({item.rating}/5)
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, isDarkMode && styles.darkCard]}>
      <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
        🛍️ Product Catalog
      </Text>
      <Text
        style={[styles.headerSubtitle, isDarkMode && styles.darkDescription]}
      >
        Using useAdvancedFetch Hook with Pagination
      </Text>

      {/* Limit Controls */}
      <View style={styles.limitControls}>
        <Text style={[styles.limitLabel, isDarkMode && styles.darkText]}>
          Items per page:
        </Text>
        <View style={styles.limitButtons}>
          {[5, 10, 20].map(limitOption => (
            <TouchableOpacity
              key={limitOption}
              style={[
                styles.limitButton,
                // Note: We could track current limit in hook state to show active
              ]}
              onPress={() => setLimit(limitOption)}
            >
              <Text style={[styles.limitButtonText]}>{limitOption}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pagination Info */}
      <View style={styles.paginationInfo}>
        <Text
          style={[styles.paginationText, isDarkMode && styles.darkDescription]}
        >
          Page {pagination.currentPage} of {pagination.totalPages} (
          {pagination.totalItems} total items)
        </Text>
      </View>

      {/* Hook Status Display */}
      <View style={styles.hookStatus}>
        <Text style={[styles.hookStatusTitle, isDarkMode && styles.darkText]}>
          🎣 Hook Status:
        </Text>
        <Text
          style={[styles.hookStatusText, isDarkMode && styles.darkDescription]}
        >
          Loading: {loading ? 'true' : 'false'} | Error:{' '}
          {error ? 'yes' : 'none'} | Data Count: {products.length}
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={[styles.footer, isDarkMode && styles.darkCard]}>
      {/* Pagination Controls */}
      <View style={styles.paginationControls}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            !pagination.hasPreviousPage && styles.paginationButtonDisabled,
          ]}
          onPress={fetchPreviousPage}
          disabled={!pagination.hasPreviousPage || loading}
        >
          <Text
            style={[
              styles.paginationButtonText,
              (!pagination.hasPreviousPage || loading) &&
                styles.paginationButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.pageNumbers}>
          {Array.from(
            { length: Math.min(5, pagination.totalPages) },
            (_, i) => {
              const pageNum = i + 1;
              const isCurrentPage = pageNum === pagination.currentPage;
              return (
                <TouchableOpacity
                  key={pageNum}
                  style={[
                    styles.pageNumberButton,
                    isCurrentPage && styles.pageNumberButtonActive,
                  ]}
                  onPress={() => fetchPage(pageNum)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.pageNumberText,
                      isCurrentPage && styles.pageNumberTextActive,
                    ]}
                  >
                    {pageNum}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            !pagination.hasNextPage && styles.paginationButtonDisabled,
          ]}
          onPress={fetchNextPage}
          disabled={!pagination.hasNextPage || loading}
        >
          <Text
            style={[
              styles.paginationButtonText,
              (!pagination.hasNextPage || loading) &&
                styles.paginationButtonTextDisabled,
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.refreshButton, loading && styles.disabledButton]}
          onPress={handleRefresh}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.refetchButton, loading && styles.disabledButton]}
          onPress={refetch}
          disabled={loading}
        >
          <Text style={styles.refetchButtonText}>🚀 Refetch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
        {error ? ' Failed to load products' : 'No products found'}
      </Text>
      {error && (
        <Text style={[styles.errorText, isDarkMode && styles.darkDescription]}>
          {error}
        </Text>
      )}
      <TouchableOpacity style={styles.retryButton} onPress={refresh}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // Improved centered loading for initial load
  if (loading && products.length === 0) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.centeredLoadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            🔄 Loading products with useAdvancedFetch...
          </Text>
          <Text
            style={[
              styles.loadingSubtext,
              isDarkMode && styles.darkDescription,
            ]}
          >
            Please wait while we fetch the latest data
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1976d2']}
            tintColor="#1976d2"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Improved centered loading overlay for subsequent requests */}
      {loading && products.length > 0 && (
        <View style={styles.loadingOverlay}>
          <View
            style={[
              styles.loadingOverlayContent,
              isDarkMode && styles.darkCard,
            ]}
          >
            <ActivityIndicator size="small" color="#1976d2" />
            <Text
              style={[styles.loadingOverlayText, isDarkMode && styles.darkText]}
            >
              useAdvancedFetch loading...
            </Text>
          </View>
        </View>
      )}
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
  // Improved centered loading container
  centeredLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  limitControls: {
    marginBottom: 16,
  },
  limitLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  limitButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  limitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
  },
  limitButtonActive: {
    backgroundColor: '#1976d2',
  },
  limitButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  limitButtonTextActive: {
    color: '#fff',
  },
  paginationInfo: {
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    color: '#666',
  },
  hookStatus: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  hookStatusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  hookStatusText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    fontSize: 14,
    color: '#ffc107',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paginationButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#ccc',
  },
  paginationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationButtonTextDisabled: {
    color: '#888',
  },
  pageNumbers: {
    flexDirection: 'row',
  },
  pageNumberButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 2,
  },
  pageNumberButtonActive: {
    backgroundColor: '#1976d2',
  },
  pageNumberText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  pageNumberTextActive: {
    color: '#fff',
  },
  // Updated action buttons section
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  refreshButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  refetchButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  refetchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Improved centered loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  loadingOverlayText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  darkDescription: {
    color: '#888',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AdvancedUseFetchScreen;
