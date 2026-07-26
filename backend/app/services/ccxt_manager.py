import ccxt.pro as ccxtpro
import asyncio
from typing import Dict, Any

class CCXTManager:
    _instances: Dict[str, Any] = {}
    _lock = asyncio.Lock()

    @classmethod
    async def get_exchange(cls, exchange_id: str) -> Any:
        """
        Get or create a CCXT Pro exchange instance.
        Caches instances to save RAM and avoid redundant connections.
        """
        if exchange_id not in cls._instances:
            async with cls._lock:
                # Double check locking pattern
                if exchange_id not in cls._instances:
                    exchange_class = getattr(ccxtpro, exchange_id, None)
                    if not exchange_class:
                        raise ValueError(f"Exchange {exchange_id} is not supported by CCXT Pro.")
                    
                    # Initialize exchange instance (optimized settings)
                    instance = exchange_class({
                        'enableRateLimit': True,
                        'newUpdates': True, # Only return new updates for sockets
                    })
                    cls._instances[exchange_id] = instance
        
        return cls._instances[exchange_id]

    @classmethod
    async def close_all(cls):
        """Close all exchange connections gracefully."""
        async with cls._lock:
            for ex in cls._instances.values():
                await ex.close()
            cls._instances.clear()

    @staticmethod
    def get_supported_exchanges():
        """Returns list of exchanges that support websockets."""
        return ccxtpro.exchanges
