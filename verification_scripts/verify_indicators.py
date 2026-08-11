import sys
import os
import pandas as pd
import time
import json

# Add backend directory to path so we can import app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.indicators.core import calculate_indicators

def main():
    print("Testing Indicators Calculation...")
    
    # Generate some dummy OHLCV data
    # 50 candles
    data = []
    base_time = int(time.time() * 1000) - (50 * 60000)
    
    for i in range(50):
        data.append([
            base_time + (i * 60000), # timestamp
            100 + i,                 # open
            105 + i,                 # high
            95 + i,                  # low
            102 + i,                 # close
            1000 + (i * 10)          # volume
        ])
        
    df = pd.DataFrame(data, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    
    indicators_to_test = ['VWAP', 'RSI', 'MACD', 'CVD']
    
    print(f"Input Data: {len(df)} candles")
    
    results = calculate_indicators(df, indicators_to_test)
    
    print("\n--- RESULTS ---")
    for ind, data in results.items():
        print(f"\n[{ind}]:")
        if isinstance(data, list):
            print(f"  Type: List, Length: {len(data)}")
            if len(data) > 0:
                print(f"  Latest Value: {data[-1]}")
        elif isinstance(data, dict):
            print(f"  Type: Dictionary, Keys: {list(data.keys())}")
            for k, v in data.items():
                if isinstance(v, list):
                    print(f"    {k} Length: {len(v)}")
                    if len(v) > 0:
                        print(f"    {k} Latest Value: {v[-1]}")
                else:
                    print(f"    {k}: {v}")
        else:
            print(f"  Type: {type(data)}, Value: {data}")

    try:
        json_output = json.dumps(results)
        print("\nJSON Serialization: SUCCESS")
    except Exception as e:
        print(f"\nJSON Serialization: FAILED ({e})")

if __name__ == "__main__":
    main()
