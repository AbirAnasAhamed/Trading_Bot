import pandas as pd
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

def get_indicator_registry():
    """Lazy load strategies to avoid circular imports and reduce startup overhead."""
    from app.indicators.strategies.vwap import calculate_vwap
    from app.indicators.strategies.rsi import calculate_rsi
    from app.indicators.strategies.macd import calculate_macd
    from app.indicators.strategies.cvd import calculate_cvd
    from app.indicators.strategies.order_blocks import calculate_order_blocks
    from app.indicators.strategies.liquidation_levels import calculate_liquidation_levels
    from app.indicators.strategies.open_interest import calculate_open_interest

    return {
        "VWAP": calculate_vwap,
        "RSI": calculate_rsi,
        "MACD": calculate_macd,
        "CVD": calculate_cvd,
        "Order Blocks": calculate_order_blocks,
        "Liquidation Levels": calculate_liquidation_levels,
        "Open Interest": calculate_open_interest,
    }

def calculate_indicators(df: pd.DataFrame, selected_indicators: List[str]) -> Dict[str, Any]:
    """
    Calculates selected indicators on the given OHLCV DataFrame.
    """
    if df.empty or not selected_indicators:
        return {}

    registry = get_indicator_registry()
    results = {}
    
    for indicator in selected_indicators:
        if indicator in registry:
            try:
                res = registry[indicator](df)
                if res:
                    results[indicator] = res
            except Exception as e:
                logger.error(f"Error calculating {indicator}: {e}")
                results[indicator] = {"error": str(e)}
                
    return results
