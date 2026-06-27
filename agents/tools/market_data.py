"""
📊 Market Data Tool
ดึงข้อมูลตลาดการเงินจาก yfinance — ทองคำ, หุ้น, สกุลเงิน
"""

import yfinance as yf
from datetime import datetime, timedelta
from crewai.tools import tool


# Symbol mapping สำหรับตลาดที่สนใจ
MARKET_SYMBOLS = {
    "ทองคำ": {"symbol": "GC=F", "name": "Gold Futures", "unit": "USD/oz"},
    "หุ้นไทย": {"symbol": "^SET.BK", "name": "SET Index", "unit": "จุด"},
    "USD/THB": {"symbol": "THB=X", "name": "USD to THB", "unit": "บาท"},
    "S&P500": {"symbol": "^GSPC", "name": "S&P 500", "unit": "จุด"},
    "น้ำมัน": {"symbol": "CL=F", "name": "Crude Oil Futures", "unit": "USD/barrel"},
    "Bitcoin": {"symbol": "BTC-USD", "name": "Bitcoin", "unit": "USD"},
    "Nasdaq": {"symbol": "^IXIC", "name": "NASDAQ Composite", "unit": "จุด"},
}


def _get_market_data(symbol: str, period: str = "5d") -> dict | None:
    """ดึงข้อมูลตลาดจาก yfinance"""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)
        
        if hist.empty:
            return None
        
        latest = hist.iloc[-1]
        previous = hist.iloc[-2] if len(hist) > 1 else hist.iloc[0]
        
        price = float(latest["Close"])
        prev_price = float(previous["Close"])
        change = price - prev_price
        change_pct = (change / prev_price) * 100 if prev_price != 0 else 0
        
        # High/Low ของช่วง
        period_high = float(hist["High"].max())
        period_low = float(hist["Low"].min())
        
        return {
            "price": round(price, 2),
            "change": round(change, 2),
            "change_pct": round(change_pct, 2),
            "high": round(period_high, 2),
            "low": round(period_low, 2),
            "volume": int(latest.get("Volume", 0)),
            "date": hist.index[-1].strftime("%Y-%m-%d"),
        }
    except Exception as e:
        return {"error": str(e)}


@tool("get_all_market_data")
def get_all_market_data(markets: str = "all") -> str:
    """
    ดึงข้อมูลตลาดการเงินล่าสุด — ราคาทองคำ, หุ้น, สกุลเงิน
    
    Args:
        markets: ตลาดที่ต้องการ ใส่ 'all' เพื่อดึงทั้งหมด
                 หรือระบุเฉพาะ เช่น 'ทองคำ,หุ้นไทย,USD/THB'
    
    Returns:
        สรุปข้อมูลตลาดล่าสุดพร้อมราคาและ % เปลี่ยนแปลง
    """
    
    # เลือกตลาดที่จะดึง
    if markets == "all":
        selected = MARKET_SYMBOLS
    else:
        market_list = [m.strip() for m in markets.split(",")]
        selected = {k: v for k, v in MARKET_SYMBOLS.items() if k in market_list}
        if not selected:
            selected = MARKET_SYMBOLS  # fallback ดึงทั้งหมด
    
    result = f"📊 **ข้อมูลตลาดการเงิน**\n"
    result += f"🕐 อัพเดท: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
    result += "=" * 60 + "\n\n"
    
    for thai_name, info in selected.items():
        data = _get_market_data(info["symbol"])
        
        if data is None:
            result += f"❌ **{thai_name}** ({info['name']}): ไม่สามารถดึงข้อมูลได้\n\n"
            continue
        
        if "error" in data:
            result += f"❌ **{thai_name}** ({info['name']}): Error - {data['error']}\n\n"
            continue
        
        # Trend indicator
        if data["change_pct"] > 0:
            trend = "🟢 ▲"
        elif data["change_pct"] < 0:
            trend = "🔴 ▼"
        else:
            trend = "⚪ ─"
        
        result += f"### {thai_name} ({info['name']})\n"
        result += f"  💰 **ราคา:** {data['price']:,.2f} {info['unit']}\n"
        result += f"  {trend} **เปลี่ยนแปลง:** {data['change']:+,.2f} ({data['change_pct']:+.2f}%)\n"
        result += f"  📈 **สูงสุด 5 วัน:** {data['high']:,.2f}\n"
        result += f"  📉 **ต่ำสุด 5 วัน:** {data['low']:,.2f}\n"
        if data["volume"] > 0:
            result += f"  📦 **ปริมาณซื้อขาย:** {data['volume']:,}\n"
        result += f"  📅 **ข้อมูลล่าสุด:** {data['date']}\n"
        result += "\n---\n\n"
    
    return result


@tool("get_stock_price")
def get_stock_price(symbol: str) -> str:
    """
    ดึงราคาหุ้นรายตัวจาก yfinance
    
    Args:
        symbol: สัญลักษณ์หุ้น เช่น 'AAPL', 'PTT.BK', 'ADVANC.BK'
    
    Returns:
        ข้อมูลราคาหุ้นล่าสุดพร้อมรายละเอียด
    """
    
    data = _get_market_data(symbol.upper())
    
    if data is None:
        return f"❌ ไม่พบข้อมูลหุ้น {symbol}"
    
    if "error" in data:
        return f"❌ Error ดึงข้อมูล {symbol}: {data['error']}"
    
    trend = "🟢 ▲" if data["change_pct"] > 0 else "🔴 ▼" if data["change_pct"] < 0 else "⚪ ─"
    
    result = f"📊 **{symbol.upper()}**\n"
    result += f"💰 ราคา: {data['price']:,.2f}\n"
    result += f"{trend} เปลี่ยนแปลง: {data['change']:+,.2f} ({data['change_pct']:+.2f}%)\n"
    result += f"📈 High: {data['high']:,.2f} | 📉 Low: {data['low']:,.2f}\n"
    result += f"📅 ข้อมูล: {data['date']}\n"
    
    return result
