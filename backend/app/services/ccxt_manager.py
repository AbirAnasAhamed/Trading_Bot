import ccxt.pro as ccxtpro
import asyncio
from typing import Dict, Any

class CCXTManager:
    _instances: Dict[str, Any] = {}
    _lock = asyncio.Lock()
    _supported_exchanges_cache: list = []

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
    async def create_authenticated_instance(cls, exchange_id: str, api_key: str, api_secret: str, passphrase: str = None) -> Any:
        """
        Creates a temporary authenticated exchange instance for REST calls (e.g. balance check).
        MUST be closed after use (await instance.close()) to prevent RAM leaks.
        """
        exchange_class = getattr(ccxtpro, exchange_id, None)
        if not exchange_class:
            raise ValueError(f"Exchange {exchange_id} is not supported.")
            
        config = {
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,
        }
        if passphrase:
            config['password'] = passphrase
            
        return exchange_class(config)

    @classmethod
    async def close_all(cls):
        """Close all exchange connections gracefully."""
        async with cls._lock:
            for ex in cls._instances.values():
                await ex.close()
            cls._instances.clear()

    @classmethod
    def get_supported_exchanges(cls):
        """Returns list of exchanges with their credential requirements."""
        if cls._supported_exchanges_cache:
            return cls._supported_exchanges_cache
            
        supported = []
        for ex_id in ccxtpro.exchanges:
            try:
                ex_class = getattr(ccxtpro, ex_id)
                # Instantiate to get accurate required credentials (as class properties aren't fully populated)
                ex_instance = ex_class()
                requires_passphrase = ex_instance.requiredCredentials.get('password', False)
                supported.append({
                    "id": ex_id,
                    "name": ex_instance.name,
                    "requires_passphrase": requires_passphrase
                })
            except Exception:
                continue
                
        cls._supported_exchanges_cache = supported
        return supported
