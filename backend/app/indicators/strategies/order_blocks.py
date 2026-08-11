import pandas as pd

def calculate_order_blocks(df: pd.DataFrame) -> list:
    """
    Placeholder for Order Blocks.
    Identifies basic bullish and bearish engulfing candles as potential order blocks.
    Returns a list of price ranges (top/bottom) and type.
    """
    if df.empty or len(df) < 2:
        return []
        
    blocks = []
    
    # Very basic naive order block detection
    for i in range(1, len(df)):
        prev = df.iloc[i-1]
        curr = df.iloc[i]
        
        # Bullish Engulfing (Bearish candle followed by larger Bullish candle)
        if prev['close'] < prev['open'] and curr['close'] > curr['open']:
            if curr['close'] > prev['open'] and curr['open'] < prev['close']:
                blocks.append({
                    'time': int(curr['timestamp']) // 1000,
                    'type': 'bullish',
                    'top': float(prev['open']),
                    'bottom': float(prev['low'])
                })
                
        # Bearish Engulfing (Bullish candle followed by larger Bearish candle)
        elif prev['close'] > prev['open'] and curr['close'] < curr['open']:
            if curr['close'] < prev['open'] and curr['open'] > prev['close']:
                blocks.append({
                    'time': int(curr['timestamp']) // 1000,
                    'type': 'bearish',
                    'top': float(prev['high']),
                    'bottom': float(prev['open'])
                })
                
    return blocks
