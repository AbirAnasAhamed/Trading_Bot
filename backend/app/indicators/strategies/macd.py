import pandas as pd
import pandas_ta as ta

def calculate_macd(df: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9) -> dict:
    """
    Calculates MACD using pandas-ta.
    Returns a dict with 'macd', 'histogram', and 'signal' arrays of {time, value}.
    """
    if df.empty or len(df) <= slow:
        return {}
    
    macd_df = df.ta.macd(fast=fast, slow=slow, signal=signal)
    
    if macd_df is None or macd_df.empty:
        return {}
        
    macd_col = f"MACD_{fast}_{slow}_{signal}"
    hist_col = f"MACDh_{fast}_{slow}_{signal}"
    sig_col = f"MACDs_{fast}_{slow}_{signal}"
    
    macd_line = []
    histogram = []
    signal_line = []
    
    for ts, m, h, s in zip(df['timestamp'], macd_df[macd_col], macd_df[hist_col], macd_df[sig_col]):
        time_val = int(ts) // 1000
        if pd.notna(m):
            macd_line.append({'time': time_val, 'value': round(float(m), 4)})
        if pd.notna(h):
            # lightweight-charts histogram can use color property based on value
            color = 'rgba(34, 197, 94, 0.5)' if float(h) >= 0 else 'rgba(239, 68, 68, 0.5)'
            histogram.append({'time': time_val, 'value': round(float(h), 4), 'color': color})
        if pd.notna(s):
            signal_line.append({'time': time_val, 'value': round(float(s), 4)})
            
    return {
        'macd': macd_line,
        'histogram': histogram,
        'signal': signal_line
    }
