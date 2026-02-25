import { Injectable, inject, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LocalStorage } from '../local-storage/local-storage';

export interface NotificationMessage {
	[key: string]: any;
}

@Injectable({
	providedIn: 'root',
})
export class NotificationHubService {
	private readonly localStorage = inject(LocalStorage);
	private hubConnection: HubConnection | null = null;
	private startConnectionPromise: Promise<void> | null = null;
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
	 * Get access token from storage. Auth store keeps tokens fresh proactively.
	 */
	private getAccessTokenFromStorage(): string | null {
		const authData = this.localStorage.getAuthData();
		return authData?.token ?? null;
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

		const token = this.getAccessTokenFromStorage();
		if (!token) {
			console.warn('No authentication token found. Cannot establish SignalR connection.');
			return;
		}

		if (!this.hubConnection) {
			const hubUrl = `${this.getHubBaseUrl()}/notificationHub`;

			this.hubConnection = new HubConnectionBuilder()
				.withUrl(hubUrl, {
					accessTokenFactory: () => {
						const currentToken = this.getAccessTokenFromStorage();
						return currentToken
							? Promise.resolve(currentToken)
							: Promise.reject(new Error('No authentication token available'));
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

