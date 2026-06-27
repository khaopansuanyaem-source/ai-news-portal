/**
 * ============================================
 * 📰 Multi-Agent AI News Analyzer — Apps Script
 * ============================================
 * Spreadsheet ID: 1bLBU_WuLlI92YmTs5Y-qsqtZ3iivZTLu-VVec8KtWiI
 * 
 * ฟังก์ชันหลัก:
 * 1. doPost() — รับข้อมูลจาก Python Agent Pipeline
 * 2. setupSheets() — สร้างโครงสร้าง Sheet อัตโนมัติ
 * 3. getLatestAnalysis() — ดึงบทวิเคราะห์ล่าสุด
 * 4. sendToLINE() — ส่งสรุปไป LINE OA (Phase 4)
 */

const SPREADSHEET_ID = "1bLBU_WuLlI92YmTs5Y-qsqtZ3iivZTLu-VVec8KtWiI";

// ==========================================
// 🔧 SETUP — รันครั้งแรกเพื่อสร้างโครงสร้าง
// ==========================================

function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Sheet 1: ข่าวการเงิน
  _createOrGetSheet(ss, "📊 Finance", [
    "ID", "วันที่", "หัวข้อข่าว", "แหล่งข่าว", "ลิงก์",
    "บทวิเคราะห์", "SWOT", "ระดับผลกระทบ", "คะแนนความน่าเชื่อถือ",
    "สถานะตรวจสอบ", "สรุปบรรณาธิการ", "Agent", "Created At"
  ]);
  
  // Sheet 2: ข่าวกีฬา
  _createOrGetSheet(ss, "⚽ Sports", [
    "ID", "วันที่", "หัวข้อข่าว", "แหล่งข่าว", "ลิงก์",
    "ประเภทกีฬา", "บทวิเคราะห์", "คะแนนความน่าเชื่อถือ",
    "สถานะตรวจสอบ", "สรุปบรรณาธิการ", "Agent", "Created At"
  ]);

  // Sheet 3: ข่าวเทคโนโลยี
  _createOrGetSheet(ss, "💻 Tech & AI", [
    "ID", "วันที่", "หัวข้อข่าว", "แหล่งข่าว", "ลิงก์",
    "บทวิเคราะห์", "Impact", "คะแนนความน่าเชื่อถือ",
    "สถานะตรวจสอบ", "สรุปบรรณาธิการ", "Agent", "Created At"
  ]);
  
  // Sheet 4: ข้อมูลตลาด
  _createOrGetSheet(ss, "💰 Market Data", [
    "วันที่", "ทองคำ (USD)", "ทองคำ %", "SET Index", "SET %",
    "USD/THB", "THB %", "S&P500", "SP %", "Bitcoin", "BTC %",
    "น้ำมัน (USD)", "Oil %", "Created At"
  ]);
  
  // Sheet 4: Agent Log
  _createOrGetSheet(ss, "🤖 Agent Log", [
    "Timestamp", "Agent", "Task", "Status", "Duration (s)",
    "Tokens Used", "Category", "Error"
  ]);
  
  // Sheet 5: Dashboard Config
  _createOrGetSheet(ss, "⚙️ Config", [
    "Key", "Value", "Description"
  ]);
  
  // ใส่ค่า Config เริ่มต้น
  const configSheet = ss.getSheetByName("⚙️ Config");
  if (configSheet.getLastRow() <= 1) {
    configSheet.getRange(2, 1, 4, 3).setValues([
      ["LINE_TOKEN", "", "LINE Channel Access Token (Phase 4)"],
      ["GEMINI_API_KEY", "", "Gemini API Key สำหรับแชทบอทตอบคำถาม"],
      ["AUTO_PUSH", "false", "ส่ง LINE อัตโนมัติเมื่อมีข่าวใหม่"],
      ["MAX_NEWS_AGE_HOURS", "48", "อายุข่าวสูงสุด (ชั่วโมง)"],
      ["ANALYSIS_LANGUAGE", "th", "ภาษาบทวิเคราะห์ (th/en)"],
    ]);
  }
  
  // ลบ Sheet1 เดิมถ้ามี
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
  
  Logger.log("✅ Setup complete! สร้างโครงสร้างเรียบร้อย");
  SpreadsheetApp.getUi().alert("✅ Setup สำเร็จ!\n\nสร้าง Sheets ทั้งหมดเรียบร้อยแล้ว");
}

function _createOrGetSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  
  // ใส่ Header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground("#1a1a2e");
  headerRange.setFontColor("#e0e0e0");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  
  // ปรับขนาดคอลัมน์
  for (let i = 1; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 150);
  }
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  return sheet;
}

// ==========================================
// 📡 WEB APP — รับข้อมูลจาก Python Agent
// ==========================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || "save_analysis";
    
    let result;
    
    // ตรวจสอบว่าเป็น LINE Webhook หรือไม่ (LINE จะส่ง events มาเป็น Array)
    if (data.events && Array.isArray(data.events)) {
      result = handleLineWebhook(data);
    } else {
      // กรณีมาจาก Python Pipeline
      switch (action) {
      case "save_analysis":
        result = _saveAnalysis(data);
        break;
      case "breaking_news":
        result = _saveAnalysis(data);
        sendBreakingNewsToLINE(data);
        break;
      case "save_market_data":
        result = _saveMarketData(data);
        break;
      case "log_agent":
        result = _logAgent(data);
        break;
      default:
        result = { error: "Unknown action: " + action };
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, ...result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// 💬 LINE CHATBOT (Real-time Q&A)
// ==========================================

function handleLineWebhook(data) {
  const lineToken = _getConfig("LINE_TOKEN");
  const geminiKey = _getConfig("GEMINI_API_KEY");
  
  if (!lineToken || !geminiKey) {
    Logger.log("Missing LINE_TOKEN or GEMINI_API_KEY");
    return { error: "Missing config" };
  }

  data.events.forEach(event => {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;
      const replyToken = event.replyToken;
      
      // ดึงข้อมูล Sheet เพื่อเป็นบริบทให้ AI
      const finance = getLatestAnalysis("finance");
      const market = getLatestMarketData();
      const context = JSON.stringify({
        finance_news: (finance.data || []).slice(0, 3).map(n => ({ title: n["หัวข้อข่าว"], analysis: n["บทวิเคราะห์"] })),
        market_data: market.data || {}
      });

      // ส่งไปถาม Gemini
      const aiReply = callGeminiAPI(userMessage, geminiKey, context);
      
      // ตอบกลับผู้ใช้
      replyToLINE(replyToken, aiReply, lineToken);
    }
  });
  
  return { status: "processed webhook" };
}

function callGeminiAPI(prompt, apiKey, context) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
  
  const systemInstruction = 
    "คุณคือ 'น้องนักวิเคราะห์' ผู้เชี่ยวชาญด้านการเงินและกีฬา ตอบคำถามด้วยความเป็นมิตร สั้น กระชับ แต่อ่านง่าย (ใช้ Emoji บ้าง) " +
    "นี่คือข้อมูลตลาดและข่าวล่าสุด ณ ปัจจุบัน เอาไปใช้อ้างอิงได้: " + context;

  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }],
    systemInstruction: {
      role: "system",
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.3
    }
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    if (json.candidates && json.candidates.length > 0) {
      return json.candidates[0].content.parts[0].text;
    }
    if (json.error) {
      return `ขออภัยค่ะ API Error: ${json.error.message} (Code: ${json.error.code})`;
    }
    return `ขออภัยค่ะ ข้อมูลไม่สมบูรณ์: ${JSON.stringify(json).substring(0, 100)}`;
  } catch (e) {
    Logger.log("Gemini Error: " + e.toString());
    return "เกิดข้อผิดพลาดในการติดต่อกับ AI ค่ะ";
  }
}

function replyToLINE(replyToken, messageText, lineToken) {
  const url = "https://api.line.me/v2/bot/message/reply";
  
  // สร้างปุ่ม Quick Reply (ปุ่มลัดด้านล่างแชท)
  const quickReply = {
    items: [
      { type: "action", action: { type: "message", label: "📰 สรุปข่าว", text: "สรุปข่าวเด่นวันนี้ให้หน่อย" } },
      { type: "action", action: { type: "message", label: "💻 ข่าวเทคโนโลยี", text: "มีข่าวไอทีอะไรน่าสนใจบ้าง" } },
      { type: "action", action: { type: "message", label: "🥇 ราคาทอง", text: "ราคาทองคำวันนี้เท่าไหร่" } },
      { type: "action", action: { type: "message", label: "📈 ตลาดหุ้น", text: "ภาพรวมตลาดหุ้นวันนี้" } },
      { type: "action", action: { type: "message", label: "⚽ ข่าวกีฬา", text: "มีข่าวกีฬาอะไรน่าสนใจบ้าง" } }
    ]
  };

  const payload = {
    replyToken: replyToken,
    messages: [{ 
      type: "text", 
      text: messageText,
      quickReply: quickReply
    }]
  };
  const options = {
    method: "post",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + lineToken },
    payload: JSON.stringify(payload)
  };
  UrlFetchApp.fetch(url, options);
}

function doGet(e) {
  const action = e.parameter.action || "latest";
  let result;
  
  switch (action) {
    case "latest":
      result = getLatestAnalysis(e.parameter.category || "finance");
      break;
    case "market":
      result = getLatestMarketData();
      break;
    case "health":
      result = { status: "ok", timestamp: new Date().toISOString() };
      break;
    default:
      result = { error: "Unknown action" };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 💾 SAVE FUNCTIONS
// ==========================================

function _saveAnalysis(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const category = data.category || "finance";
  
  let sheetName = "📊 Finance";
  if (category === "sports") sheetName = "⚽ Sports";
  else if (category === "tech") sheetName = "💻 Tech & AI";
  
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) return { error: "Sheet not found: " + sheetName };
  
  const id = Utilities.getUuid().slice(0, 8);
  const now = new Date();
  
  // Extract Sentiment & Impact
  let sentiment = "";
  let impact = "Medium";
  const analysisText = data.analysis || "";
  const sentimentMatch = analysisText.match(/Sentiment Score:\s*([^\n]+)/i);
  if (sentimentMatch) sentiment = sentimentMatch[1];
  const impactMatch = analysisText.match(/Impact:\s*([^\n]+)/i);
  if (impactMatch) impact = impactMatch[1];
  
  if (category === "finance") {
    // Note: Append to existing columns to avoid breaking older sheets
    sheet.appendRow([
      id,
      Utilities.formatDate(now, "Asia/Bangkok", "yyyy-MM-dd HH:mm"),
      data.title || "",
      data.source || "",
      data.link || "",
      data.analysis || "",
      data.swot || "",
      impact, // ใช้แทน ระดับผลกระทบ
      data.credibility_score || 0,
      data.fact_check_status || "Pending",
      sentiment, // ใส่แทน สรุปบรรณาธิการชั่วคราว หรือใช้ column ใหม่ (ถ้า Sheet ถูกอัปเดต)
      data.agent || "CrewAI",
      now.toISOString()
    ]);
  } else if (category === "sports") {
    sheet.appendRow([
      id,
      Utilities.formatDate(now, "Asia/Bangkok", "yyyy-MM-dd HH:mm"),
      data.title || "",
      data.source || "",
      data.link || "",
      data.sport_type || "football",
      data.analysis || "",
      data.credibility_score || 0,
      data.fact_check_status || "Pending",
      data.editor_summary || "",
      data.agent || "CrewAI",
      now.toISOString()
    ]);
  } else {
    // Tech & AI
    sheet.appendRow([
      id,
      Utilities.formatDate(now, "Asia/Bangkok", "yyyy-MM-dd HH:mm"),
      data.title || "",
      data.source || "",
      data.link || "",
      data.analysis || "",
      impact,
      data.credibility_score || 0,
      data.fact_check_status || "Pending",
      data.editor_summary || "",
      data.agent || "CrewAI",
      now.toISOString()
    ]);
  }
  
  // Log agent activity
  _logAgent({
    agent: data.agent || "System",
    task: "save_analysis",
    status: "success",
    duration: data.duration || 0,
    tokens: data.tokens_used || 0,
    category: category
  });
  
  return { id: id, sheet: sheetName, message: "บันทึกสำเร็จ" };
}

function _saveMarketData(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("💰 Market Data");
  if (!sheet) return { error: "Market Data sheet not found" };
  
  const now = new Date();
  sheet.appendRow([
    Utilities.formatDate(now, "Asia/Bangkok", "yyyy-MM-dd HH:mm"),
    data.gold_price || "", data.gold_change || "",
    data.set_index || "", data.set_change || "",
    data.usd_thb || "", data.thb_change || "",
    data.sp500 || "", data.sp_change || "",
    data.bitcoin || "", data.btc_change || "",
    data.oil || "", data.oil_change || "",
    now.toISOString()
  ]);
  
  return { message: "บันทึกข้อมูลตลาดสำเร็จ" };
}

function _logAgent(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("🤖 Agent Log");
  if (!sheet) return { error: "Agent Log sheet not found" };
  
  sheet.appendRow([
    new Date().toISOString(),
    data.agent || "Unknown",
    data.task || "",
    data.status || "unknown",
    data.duration || 0,
    data.tokens || 0,
    data.category || "",
    data.error || ""
  ]);
  
  return { message: "Log saved" };
}

// ==========================================
// 📤 READ FUNCTIONS
// ==========================================

function getLatestAnalysis(category) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  let sheetName = "📊 Finance";
  if (category === "sports") sheetName = "⚽ Sports";
  else if (category === "tech") sheetName = "💻 Tech & AI";
  
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet || sheet.getLastRow() <= 1) {
    return { data: [], message: "ยังไม่มีข้อมูล" };
  }
  
  const lastRow = sheet.getLastRow();
  const startRow = Math.max(2, lastRow - 9); // ดึง 10 รายการล่าสุด
  const numRows = lastRow - startRow + 1;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const data = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).getValues();
  
  const results = data.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  }).reverse(); // ล่าสุดก่อน
  
  return { data: results, count: results.length };
}

function getLatestMarketData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("💰 Market Data");
  
  if (!sheet || sheet.getLastRow() <= 1) {
    return { data: null, message: "ยังไม่มีข้อมูลตลาด" };
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const lastRow = sheet.getRange(sheet.getLastRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const result = {};
  headers.forEach((h, i) => { result[h] = lastRow[i]; });
  
  return { data: result };
}

// ==========================================
// 📱 LINE OA — Premium Flex Message
// ==========================================

function _getConfig(key) {
  if (key === "LINE_TOKEN") return "dpwnkqW9OYDL/mU6TJjDsAzqBWxiCxPZzUWNYJ8FDrqiLN7cpbTmQy9I2AbZCzLkd02gs6Izgs5qdhSlHec10oC1xx9ZnQmZHu6m/gSWtz760856CSa+RdagHFGJmIMhd+lvMmfcyDSv/7/OqUOdbwdB04t89/1O/w1cDnyilFU=";
  if (key === "GEMINI_API_KEY") return "AIzaSyDCazvZXEZB5Vl9cgSPN_CbpvZ0qEnITgE";
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("⚙️ Config");
  if (!sheet) return "";
  const data = sheet.getDataRange().getValues();
  for (const row of data) {
    if (row[0] === key) return row[1];
  }
  return "";
}

function sendDailyFlexToLINE() {
  const lineToken = _getConfig("LINE_TOKEN");
  if (!lineToken) { Logger.log("❌ LINE_TOKEN not set"); return; }

  const finance = getLatestAnalysis("finance");
  const sports = getLatestAnalysis("sports");
  const tech = getLatestAnalysis("tech");
  const market = getLatestMarketData();
  const webAppUrl = _getConfig("WEB_APP_URL") || "https://news.google.com";

  const flexContents = _buildPremiumCarousel(finance, sports, tech, market, webAppUrl);

  const payload = {
    messages: [{
      type: "flex",
      altText: "📰 สรุปข่าวประจำวัน — " + Utilities.formatDate(new Date(), "Asia/Bangkok", "dd MMM yyyy"),
      contents: flexContents
    }]
  };

  const options = {
    method: "post",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + lineToken },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const resp = UrlFetchApp.fetch("https://api.line.me/v2/bot/message/broadcast", options);
    Logger.log("LINE Status: " + resp.getResponseCode());
    return { status: resp.getResponseCode() };
  } catch (err) {
    Logger.log("LINE Error: " + err);
    return { error: err.toString() };
  }
}

function sendBreakingNewsToLINE(data) {
  const lineToken = _getConfig("LINE_TOKEN");
  if (!lineToken) return { error: "No LINE token" };

  const webAppUrl = ScriptApp.getService().getUrl();
  const sentimentMatch = (data.analysis || "").match(/Sentiment Score:\s*([^\n]+)/i);
  const sentiment = sentimentMatch ? sentimentMatch[1] : "";

  const payload = {
    messages: [
      {
        type: "flex",
        altText: "🚨 BREAKING NEWS: " + (data.title || "ข่าวด่วน"),
        contents: {
          type: "bubble",
          size: "giga",
          styles: { header: { backgroundColor: "#B71C1C" }, body: { backgroundColor: "#FFEBEE" } },
          header: {
            type: "box", layout: "vertical", paddingAll: "20px", contents: [
              { type: "text", text: "🚨 BREAKING NEWS", color: "#FFFFFF", size: "xl", weight: "bold" },
              { type: "text", text: data.category ? data.category.toUpperCase() : "ALERT", color: "#FFCDD2", size: "sm" }
            ]
          },
          body: {
            type: "box", layout: "vertical", spacing: "md", paddingAll: "20px", contents: [
              { type: "text", text: data.title || "ข่าวด่วน", weight: "bold", size: "lg", color: "#C62828", wrap: true },
              { type: "text", text: "ที่มา: " + (data.source || "-"), size: "xs", color: "#7F8C8D" },
              { type: "separator", margin: "md" },
              { type: "text", text: (data.analysis || "").substring(0, 300) + "...", size: "sm", wrap: true },
              ...(sentiment ? [{ type: "text", text: "Sentiment: " + sentiment, size: "sm", color: "#C62828", weight: "bold", margin: "md" }] : [])
            ]
          },
          footer: {
            type: "box", layout: "vertical", paddingAll: "15px", contents: [
              { type: "button", style: "primary", color: "#D32F2F", action: { type: "uri", label: "อ่านฉบับเต็ม", uri: webAppUrl } }
            ]
          }
        }
      }
    ]
  };

  const options = {
    method: "post",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + lineToken },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/broadcast", options);
}

// ─── Premium Carousel (Finance + Sports + Tech + Market) ───

function _buildPremiumCarousel(finance, sports, tech, market, webUrl) {
  const today = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd MMM yyyy");
  const bubbles = [];

  // ── Bubble 1: ข่าวการเงิน ──
  const finItems = (finance.data || []).slice(0, 3);
  const finBody = finItems.length > 0
    ? finItems.map(function(item, i) {
        return { type: "box", layout: "horizontal", spacing: "sm", margin: i > 0 ? "lg" : "none", contents: [
          { type: "text", text: "📌", size: "sm", flex: 0 },
          { type: "text", text: item["หัวข้อข่าว"] || item["title"] || "ข่าว", wrap: true, size: "sm", color: "#3E2723", flex: 5 }
        ]};
      })
    : [{ type: "text", text: "ยังไม่มีข่าวการเงินวันนี้", size: "sm", color: "#888888", wrap: true }];

  bubbles.push({
    type: "bubble", size: "mega",
    styles: { header: { backgroundColor: "#2C3E50" }, body: { backgroundColor: "#FFF8E1" }, footer: { backgroundColor: "#FFF8E1" } },
    header: { type: "box", layout: "vertical", paddingAll: "20px", contents: [
      { type: "text", text: "💰 ข่าวการเงิน", color: "#FFFFFF", size: "xl", weight: "bold" },
      { type: "text", text: today, color: "#B0BEC5", size: "xs", margin: "sm" }
    ]},
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "20px", contents: finBody },
    footer: { type: "box", layout: "vertical", paddingAll: "15px", contents: [
      { type: "button", style: "primary", color: "#5D4037", height: "sm",
        action: { type: "uri", label: "📖 อ่านเพิ่มเติม", uri: webUrl + "?tab=finance" } }
    ]}
  });

  // ── Bubble 2: ข่าวเทคโนโลยี ──
  const techItems = (tech.data || []).slice(0, 3);
  const techBody = techItems.length > 0
    ? techItems.map(function(item, i) {
        return { type: "box", layout: "horizontal", spacing: "sm", margin: i > 0 ? "lg" : "none", contents: [
          { type: "text", text: "💻", size: "sm", flex: 0 },
          { type: "text", text: item["หัวข้อข่าว"] || item["title"] || "ข่าว", wrap: true, size: "sm", color: "#2E4053", flex: 5 }
        ]};
      })
    : [{ type: "text", text: "ยังไม่มีข่าวเทคโนโลยีวันนี้", size: "sm", color: "#888888", wrap: true }];

  bubbles.push({
    type: "bubble", size: "mega",
    styles: { header: { backgroundColor: "#8E44AD" }, body: { backgroundColor: "#F4ECF7" }, footer: { backgroundColor: "#F4ECF7" } },
    header: { type: "box", layout: "vertical", paddingAll: "20px", contents: [
      { type: "text", text: "💻 ข่าวเทคโนโลยี & AI", color: "#FFFFFF", size: "xl", weight: "bold" },
      { type: "text", text: today, color: "#D2B4DE", size: "xs", margin: "sm" }
    ]},
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "20px", contents: techBody },
    footer: { type: "box", layout: "vertical", paddingAll: "15px", contents: [
      { type: "button", style: "primary", color: "#7D3C98", height: "sm",
        action: { type: "uri", label: "📖 อ่านเพิ่มเติม", uri: webUrl + "?tab=tech" } }
    ]}
  });

  // ── Bubble 3: ข่าวกีฬา ──
  const sportItems = (sports.data || []).slice(0, 3);
  const sportBody = sportItems.length > 0
    ? sportItems.map(function(item, i) {
        return { type: "box", layout: "horizontal", spacing: "sm", margin: i > 0 ? "lg" : "none", contents: [
          { type: "text", text: "⚽", size: "sm", flex: 0 },
          { type: "text", text: item["หัวข้อข่าว"] || item["title"] || "ข่าว", wrap: true, size: "sm", color: "#1B5E20", flex: 5 }
        ]};
      })
    : [{ type: "text", text: "ยังไม่มีข่าวกีฬาวันนี้", size: "sm", color: "#888888", wrap: true }];

  bubbles.push({
    type: "bubble", size: "mega",
    styles: { header: { backgroundColor: "#1B5E20" }, body: { backgroundColor: "#E8F5E9" }, footer: { backgroundColor: "#E8F5E9" } },
    header: { type: "box", layout: "vertical", paddingAll: "20px", contents: [
      { type: "text", text: "⚽ กีฬา & บอลโลก 2026", color: "#FFFFFF", size: "xl", weight: "bold" },
      { type: "text", text: today, color: "#A5D6A7", size: "xs", margin: "sm" }
    ]},
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "20px", contents: sportBody },
    footer: { type: "box", layout: "vertical", paddingAll: "15px", contents: [
      { type: "button", style: "primary", color: "#2E7D32", height: "sm",
        action: { type: "uri", label: "📖 อ่านเพิ่มเติม", uri: webUrl + "?tab=sports" } }
    ]}
  });

  // ── Bubble 3: ข้อมูลตลาด ──
  const mkt = market.data || {};
  const mktRows = [
    { label: "🥇 ทองคำ", val: mkt["ทองคำ (USD)"], chg: mkt["ทองคำ %"] },
    { label: "📈 SET", val: mkt["SET Index"], chg: mkt["SET %"] },
    { label: "💵 USD/THB", val: mkt["USD/THB"], chg: mkt["THB %"] },
    { label: "₿ Bitcoin", val: mkt["Bitcoin"], chg: mkt["BTC %"] },
  ];

  const mktBody = mktRows.map(function(r) {
    const v = r.val ? String(r.val) : "-";
    const c = r.chg ? (Number(r.chg) >= 0 ? "🟢 +" + r.chg + "%" : "🔴 " + r.chg + "%") : "";
    return { type: "box", layout: "horizontal", margin: "md", contents: [
      { type: "text", text: r.label, size: "sm", color: "#333333", flex: 3 },
      { type: "text", text: v, size: "sm", color: "#333333", flex: 3, align: "end" },
      { type: "text", text: c, size: "xs", color: Number(r.chg) >= 0 ? "#2E7D32" : "#C62828", flex: 3, align: "end" }
    ]};
  });

  bubbles.push({
    type: "bubble", size: "mega",
    styles: { header: { backgroundColor: "#0D47A1" }, body: { backgroundColor: "#E3F2FD" }, footer: { backgroundColor: "#E3F2FD" } },
    header: { type: "box", layout: "vertical", paddingAll: "20px", contents: [
      { type: "text", text: "📊 ข้อมูลตลาดวันนี้", color: "#FFFFFF", size: "xl", weight: "bold" },
      { type: "text", text: today, color: "#90CAF9", size: "xs", margin: "sm" }
    ]},
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "20px", contents: mktBody },
    footer: { type: "box", layout: "vertical", paddingAll: "15px", contents: [
      { type: "button", style: "primary", color: "#1565C0", height: "sm",
        action: { type: "uri", label: "📖 อ่านเพิ่มเติม", uri: webUrl + "?tab=market" } }
    ]}
  });

  return { type: "carousel", contents: bubbles };
}

// ==========================================
// ⏰ TRIGGER — ตั้งเวลา 06:00 น. ทุกวัน
// ==========================================

function createDailyTrigger() {
  // ลบ trigger เก่า
  ScriptApp.getProjectTriggers().forEach(function(t) { ScriptApp.deleteTrigger(t); });

  // ตั้ง trigger — รันทุกวัน 06:00 น. เวลาไทย
  ScriptApp.newTrigger("dailyDigest")
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .inTimezone("Asia/Bangkok")
    .create();

  Logger.log("✅ Daily trigger created — 06:00 AM Bangkok time");
  SpreadsheetApp.getUi().alert("✅ ตั้ง Trigger สำเร็จ!\n\nจะส่งสรุปข่าวทุกวัน 06:00 น.");
}

function dailyDigest() {
  Logger.log("📰 Daily digest triggered at " + new Date().toISOString());

  // ดึงข้อมูลล่าสุด
  const finance = getLatestAnalysis("finance");
  const sports = getLatestAnalysis("sports");
  const market = getLatestMarketData();

  Logger.log("Finance: " + (finance.count || 0) + " | Sports: " + (sports.count || 0));

  // ส่ง Flex Message ไป LINE OA
  const autoPush = _getConfig("AUTO_PUSH");
  if (autoPush === "true") {
    const result = sendDailyFlexToLINE();
    Logger.log("LINE push result: " + JSON.stringify(result));
  } else {
    Logger.log("⏸️ AUTO_PUSH is off — skipping LINE push");
  }
}
