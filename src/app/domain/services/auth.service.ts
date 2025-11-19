import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

/**
 * Authentication Service
 * Manages user authentication state and token storage
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // Reactive authentication state
  private currentUserSignal = signal<AuthUser | null>(this.loadUserFromStorage());
  private tokenSignal = signal<string | null>(this.loadTokenFromStorage());

  // Public computed signals
  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => !!this.tokenSignal());

  constructor(private router: Router) {}

  /**
   * Login user with credentials
   */
  login(email: string, password: string): Promise<boolean> {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock successful login
        const mockUser: AuthUser = {
          id: 1,
          name: 'John Doe',
          email: email,
          avatar: 'https://i.pravatar.cc/150?img=12',
          role: 'Administrator',
        };
        const mockToken = 'mock-jwt-token-' + Date.now();

        this.setAuthentication(mockUser, mockToken);
        resolve(true);
      }, 1000);
    });
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.clearAuthentication();
    this.router.navigate(['/login']);
  }

  /**
   * Set authentication state
   */
  private setAuthentication(user: AuthUser, token: string): void {
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);
    this.saveToStorage(user, token);
  }

  /**
   * Clear authentication state
   */
  private clearAuthentication(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    this.clearStorage();
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(user: AuthUser, token: string): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Load user from localStorage
   */
  private loadUserFromStorage(): AuthUser | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  /**
   * Load token from localStorage
   */
  private loadTokenFromStorage(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Clear localStorage
   */
  private clearStorage(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
