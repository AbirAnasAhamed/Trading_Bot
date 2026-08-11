import pandas as pd

def calculate_cvd(df: pd.DataFrame) -> list:
    """
    Placeholder for Cumulative Volume Delta.
    Proper CVD requires tick-level data (watch_trades) with buy/sell side.
    Here we mock it using price action as a proxy for delta (close > open = buy volume).
    """
    if df.empty:
        return []
        
    result = []
    cum_delta = 0
    for _, row in df.iterrows():
        # Proxy delta: if candle is green, add volume, else subtract
        delta = row['volume'] if row['close'] >= row['open'] else -row['volume']
        cum_delta += delta
        result.append({
            'time': int(row['timestamp']) // 1000,
            'value': float(cum_delta)
        })
        
    return result
