from app.core.logger import get_logger

logger = get_logger(__name__)

class RiskManager:
    def __init__(self, stop_loss_pct: float = 0.02, take_profit_pct: float = 0.05):
        self.stop_loss_pct = stop_loss_pct
        self.take_profit_pct = take_profit_pct
        self.entry_price = 0.0
        
    def set_entry(self, price: float):
        self.entry_price = price
        
    def should_exit(self, current_price: float, position: str) -> bool:
        if position != 'LONG' or self.entry_price == 0:
            return False
            
        pnl_pct = (current_price - self.entry_price) / self.entry_price
        
        if pnl_pct <= -self.stop_loss_pct:
            logger.info(f"Stop loss triggered! PnL: {pnl_pct*100:.2f}%")
            return True
            
        if pnl_pct >= self.take_profit_pct:
            logger.info(f"Take profit triggered! PnL: {pnl_pct*100:.2f}%")
            return True
            
        return False
