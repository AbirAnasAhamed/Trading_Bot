import pandas as pd

def calculate_open_interest(df: pd.DataFrame) -> list:
    """
    Real Open Interest is fetched asynchronously via CCXT in ccxt_stream.py.
    This function returns an empty list to avoid conflicts.
    """
    return []
