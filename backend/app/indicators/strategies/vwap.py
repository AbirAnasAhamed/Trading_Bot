import pandas as pd
import pandas_ta as ta

def calculate_vwap(df: pd.DataFrame) -> list:
    """
    Calculates VWAP using pandas-ta.
    Returns a list of dicts: [{'time': ts, 'value': val}, ...]
    """
    if df.empty or len(df) < 2:
        return []
    
    # Needs index to be datetime for pandas-ta vwap in some versions,
    # or we can pass high, low, close, volume explicitly if it supports it.
    # Pandas-ta's vwap typically uses the df index for anchoring (e.g., daily).
    # Since we are passing raw OHLCV, we can calculate rolling VWAP or daily VWAP.
    # Let's use standard pandas-ta vwap. It expects a datetime index.
    
    temp_df = df.copy()
    temp_df['datetime'] = pd.to_datetime(temp_df['timestamp'], unit='ms')
    temp_df.set_index('datetime', inplace=True)
    
    vwap_series = ta.vwap(high=temp_df['high'], low=temp_df['low'], close=temp_df['close'], volume=temp_df['volume'])
    
    if vwap_series is None:
        return []
        
    result = []
    for ts, val in zip(df['timestamp'], vwap_series):
        if pd.notna(val):
            result.append({'time': int(ts) // 1000, 'value': round(float(val), 2)})
            
    return result
