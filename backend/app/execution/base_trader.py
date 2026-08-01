from abc import ABC, abstractmethod

class BaseTrader(ABC):
    @abstractmethod
    async def execute_buy(self, symbol: str, price: float, amount: float):
        pass
        
    @abstractmethod
    async def execute_sell(self, symbol: str, price: float, amount: float):
        pass

    @abstractmethod
    async def get_pnl(self) -> float:
        pass
