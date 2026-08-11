import pandas as pd
import pandas_ta as ta

def calculate_rsi(df: pd.DataFrame, length: int = 14) -> list:
    """
    Calculates RSI using pandas-ta.
    Returns a list of dicts: [{'time': ts, 'value': val}, ...]
    optimized for lightweight-charts.
    """
    if df.empty or len(df) <= length:
        return []
    
    # Calculate RSI
    # pandas-ta appends a column named 'RSI_14' by default
    rsi_series = df.ta.rsi(length=length)
    
    if rsi_series is None:
        return []
        
    # Extract only valid (non-NaN) values to reduce payload size
    result = []
    for ts, val in zip(df['timestamp'], rsi_series):
        if pd.notna(val):
            # lightweight-charts expects timestamp in seconds for D, W, M or specific format, 
            # assuming df['timestamp'] is in milliseconds from CCXT, we convert to seconds if needed,
            # or keep it as is if frontend handles it. Let's assume frontend expects ms.
            result.append({'time': int(ts) // 1000 if not pd.isna(ts) else 0, 'value': round(float(val), 2)})
            
    return result
