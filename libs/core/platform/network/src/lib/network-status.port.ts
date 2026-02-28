import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export type NetworkState = 'online' | 'offline' | 'slow';

export interface NetworkStatusPort {
  state$(): Observable<NetworkState>;
  isOnline(): Promise<boolean>;
}

export const NETWORK_STATUS_PORT = new InjectionToken<NetworkStatusPort>('NETWORK_STATUS_PORT');
