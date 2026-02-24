import { Injectable, inject, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Subject, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LocalStorage } from '../local-storage/local-storage';
import { AuthApiService } from '../../api/auth/auth-api-service';
import { AuthStore } from '../../stores/auth/auth.store';
import { IAuthData, IRefreshTokenRequest } from '../../interfaces';

export interface NotificationMessage {
	[key: string]: any;
}

@Injectable({
	providedIn: 'root',
})
export class NotificationHubService {
	private readonly localStorage = inject(LocalStorage);
	private readonly authApiService = inject(AuthApiService);
	private readonly authStore = inject(AuthStore);
	private hubConnection: HubConnection | null = null;
	private startConnectionPromise: Promise<void> | null = null;
	private refreshTokenPromise: Promise<string | null> | null = null;
	private readonly notificationSubject = new Subject<NotificationMessage>();

	// Signal for connection state
	public readonly connectionState = signal<HubConnectionState>(HubConnectionState.Disconnected);
	public readonly isConnected = signal<boolean>(false);

	/**
	 * Get the base URL for SignalR hub (removes /api/ from baseUrl)
	 */
	private getHubBaseUrl(): string {
		const baseUrl = environment.baseUrl.replace('/api/', '').replace('/api', '');
		return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
	}

	/**
	 * Checks if access token is expired or about to expire soon.
	 */
	private isAccessTokenExpiringSoon(authData: IAuthData, thresholdInSeconds = 60): boolean {
		if (!authData.expiresAt) {
			return true;
		}

		const expiresAtMs = new Date(authData.expiresAt).getTime();
		if (Number.isNaN(expiresAtMs)) {
			return true;
		}

		const thresholdMs = thresholdInSeconds * 1000;
		return expiresAtMs <= Date.now() + thresholdMs;
	}

	/**
	 * Checks whether refresh token is still valid.
	 */
	private isRefreshTokenValid(authData: IAuthData): boolean {
		if (!authData.refreshToken || !authData.refreshTokenExpiresAt) {
			return false;
		}

		const refreshTokenExpiresAtMs = new Date(authData.refreshTokenExpiresAt).getTime();
		if (Number.isNaN(refreshTokenExpiresAtMs)) {
			return false;
		}

		return refreshTokenExpiresAtMs > Date.now();
	}

	/**
	 * Returns a valid access token, refreshing it when needed.
	 */
	private async getValidAccessToken(): Promise<string | null> {
		const authData = this.localStorage.getAuthData();

		if (!authData?.token) {
			return null;
		}

		if (!this.isAccessTokenExpiringSoon(authData)) {
			return authData.token;
		}

		if (!this.isRefreshTokenValid(authData)) {
			console.warn('Refresh token is missing or expired.');
			return null;
		}

		if (this.refreshTokenPromise) {
			return this.refreshTokenPromise;
		}

		this.refreshTokenPromise = (async () => {
			try {
				const refreshRequest: IRefreshTokenRequest = {
					accessToken: authData.token,
					refreshToken: authData.refreshToken,
				};

				const response = await firstValueFrom(this.authApiService.refreshToken(refreshRequest));
				if (response.success && response.body?.token) {
					this.authStore.updateAuthDataInStorage(response);
					return response.body.token;
				}

				return null;
			} catch (error) {
				console.error('Failed to refresh token for SignalR connection.', error);
				return null;
			} finally {
				this.refreshTokenPromise = null;
			}
		})();

		return this.refreshTokenPromise;
	}

	/**
	 * Start the SignalR connection
	 */
	public async startConnection(): Promise<void> {
		if (this.hubConnection?.state === HubConnectionState.Connected) {
			console.log('SignalR connection already established');
			return;
		}

		if (this.startConnectionPromise) {
			return this.startConnectionPromise;
		}

		const token = await this.getValidAccessToken();
		if (!token) {
			console.warn('No authentication token found. Cannot establish SignalR connection.');
			return;
		}

		if (!this.hubConnection) {
			const hubUrl = `${this.getHubBaseUrl()}/notificationHub`;

			this.hubConnection = new HubConnectionBuilder()
				.withUrl(hubUrl, {
					accessTokenFactory: async () => {
						const currentToken = await this.getValidAccessToken();
						if (!currentToken) {
							throw new Error('No valid authentication token available');
						}
						return currentToken;
					},
				})
				.withAutomaticReconnect({
					nextRetryDelayInMilliseconds: (retryContext: any) => {
						// Exponential backoff: 0, 2, 10, 30 seconds
						if (retryContext.previousRetryCount === 0) return 2000;
						if (retryContext.previousRetryCount === 1) return 10000;
						if (retryContext.previousRetryCount === 2) return 30000;
						return 30000; // Max 30 seconds
					},
				})
				.configureLogging(environment.enableDebug ? LogLevel.Information : LogLevel.Warning)
				.build();

			// Register ReceiveNotification event handler
			this.hubConnection.on('ReceiveNotification', (notification: NotificationMessage) => {
				console.log('Received notification:', notification);
				this.notificationSubject.next(notification);
			});

			// Handle connection state changes
			this.hubConnection.onclose((error: any) => {
				console.log('SignalR connection closed', error);
				this.connectionState.set(HubConnectionState.Disconnected);
				this.isConnected.set(false);
			});

			this.hubConnection.onreconnecting((error: any) => {
				console.log('SignalR reconnecting...', error);
				this.connectionState.set(HubConnectionState.Reconnecting);
				this.isConnected.set(false);
			});

			this.hubConnection.onreconnected((connectionId: any) => {
				console.log('SignalR reconnected. Connection ID:', connectionId);
				this.connectionState.set(HubConnectionState.Connected);
				this.isConnected.set(true);
			});
		}

		this.startConnectionPromise = this.hubConnection
			.start()
			.then(() => {
				console.log('SignalR connection started successfully');
				this.connectionState.set(HubConnectionState.Connected);
				this.isConnected.set(true);
			})
			.catch((error) => {
				console.error('Error starting SignalR connection:', error);
				this.connectionState.set(HubConnectionState.Disconnected);
				this.isConnected.set(false);
				throw error;
			})
			.finally(() => {
				this.startConnectionPromise = null;
			});

		return this.startConnectionPromise;
	}

	/**
	 * Stop the SignalR connection
	 */
	public async stopConnection(): Promise<void> {
		if (this.hubConnection) {
			try {
				await this.hubConnection.stop();
				console.log('SignalR connection stopped');
			} catch (error) {
				console.error('Error stopping SignalR connection:', error);
			} finally {
				this.hubConnection = null;
				this.connectionState.set(HubConnectionState.Disconnected);
				this.isConnected.set(false);
			}
		}
	}

	/**
	 * Get observable for receiving notifications
	 */
	public onReceiveNotification(): Observable<NotificationMessage> {
		return this.notificationSubject.asObservable();
	}

	/**
	 * Check if connection is established
	 */
	public isConnectionEstablished(): boolean {
		return this.hubConnection?.state === HubConnectionState.Connected;
	}
}

