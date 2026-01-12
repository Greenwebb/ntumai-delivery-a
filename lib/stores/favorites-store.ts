// Favorites Store - Manages customer's favorite products
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteProduct {
  id: string;
  name: string;
  vendor: string;
  vendorId: string;
  price: number;
  image?: string;
  category: string;
  addedAt: string;
  lastOrdered?: string;
  orderCount: number;
}

const FAVORITES_KEY = '@ntumai_favorites';

class FavoritesStore {
  private favorites: FavoriteProduct[] = [];
  private listeners: Set<() => void> = new Set();

  async init() {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        this.favorites = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }

  private async save() {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(this.favorites));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getFavorites(): FavoriteProduct[] {
    return [...this.favorites];
  }

  isFavorite(productId: string): boolean {
    return this.favorites.some(f => f.id === productId);
  }

  async addFavorite(product: Omit<FavoriteProduct, 'addedAt' | 'orderCount'>) {
    if (this.isFavorite(product.id)) return;

    const favorite: FavoriteProduct = {
      ...product,
      addedAt: new Date().toISOString(),
      orderCount: 0,
    };

    this.favorites.unshift(favorite);
    await this.save();
  }

  async removeFavorite(productId: string) {
    this.favorites = this.favorites.filter(f => f.id !== productId);
    await this.save();
  }

  async toggleFavorite(product: Omit<FavoriteProduct, 'addedAt' | 'orderCount'>) {
    if (this.isFavorite(product.id)) {
      await this.removeFavorite(product.id);
      return false;
    } else {
      await this.addFavorite(product);
      return true;
    }
  }

  async updateOrderCount(productId: string) {
    const favorite = this.favorites.find(f => f.id === productId);
    if (favorite) {
      favorite.orderCount += 1;
      favorite.lastOrdered = new Date().toISOString();
      await this.save();
    }
  }

  getSortedByFrequency(): FavoriteProduct[] {
    return [...this.favorites].sort((a, b) => b.orderCount - a.orderCount);
  }

  getSortedByRecent(): FavoriteProduct[] {
    return [...this.favorites].sort((a, b) => 
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }

  getSortedByName(): FavoriteProduct[] {
    return [...this.favorites].sort((a, b) => a.name.localeCompare(b.name));
  }

  getSortedByPrice(): FavoriteProduct[] {
    return [...this.favorites].sort((a, b) => a.price - b.price);
  }

  async clearAll() {
    this.favorites = [];
    await this.save();
  }
}

export const favoritesStore = new FavoritesStore();
