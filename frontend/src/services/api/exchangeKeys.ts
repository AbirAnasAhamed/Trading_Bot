import { apiClient } from './client';

export interface ExchangeKey {
  id: number;
  exchange_id: string;
  is_active: boolean;
  created_at: string;
  masked_api_key: string;
}

export interface SupportedExchange {
  id: string;
  name: string;
  requires_passphrase: boolean;
}

export interface ExchangeKeyCreate {
  exchange_id: string;
  api_key: string;
  api_secret: string;
  passphrase?: string;
}

export const exchangeKeysService = {
  getSupported: (): Promise<SupportedExchange[]> => {
    return apiClient<SupportedExchange[]>('/exchange-keys/supported', { method: 'GET' });
  },
  
  getKeys: (): Promise<ExchangeKey[]> => {
    return apiClient<ExchangeKey[]>('/exchange-keys', { method: 'GET' });
  },
  
  addKey: (data: ExchangeKeyCreate): Promise<ExchangeKey> => {
    return apiClient<ExchangeKey>('/exchange-keys', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  deleteKey: (exchangeId: string): Promise<void> => {
    return apiClient<void>(`/exchange-keys/${exchangeId}`, { method: 'DELETE' });
  }
};
