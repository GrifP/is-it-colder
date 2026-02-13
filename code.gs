function sendSlackNotification(message) {
  const SLACK_WEBHOOK_URL = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');
  
  if (!SLACK_WEBHOOK_URL) {
    throw new Error('SLACK_WEBHOOK_URL not configured in Script Properties');
  }
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: message })
  };
  
  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, options);
}

function checkWeather() {
  const properties = PropertiesService.getScriptProperties();
  const OPENWEATHER_API_KEY = properties.getProperty('OPENWEATHER_API_KEY');
  const CITY_1 = properties.getProperty('CITY_1') || 'Boston';
  const CITY_2 = properties.getProperty('CITY_2') || 'Phoenix';
  
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OPENWEATHER_API_KEY not configured in Script Properties');
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Initialize headers if needed
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', `${CITY_1} Temp (°F)`, `${CITY_2} Temp (°F)`, `${CITY_2} Colder?`, 'State Changed?']);
  }
  
  try {
    // Fetch weather data
    const city1Temp = getTemperature(CITY_1, OPENWEATHER_API_KEY);
    const city2Temp = getTemperature(CITY_2, OPENWEATHER_API_KEY);
    const timestamp = new Date().toLocaleString();
    
    // Compare states
    const wasCity2Colder = properties.getProperty('city2Colder') === 'true';
    const isCity2Colder = city2Temp < city1Temp;
    const stateChanged = isCity2Colder !== wasCity2Colder;
    
    // Log to sheet
    sheet.appendRow([timestamp, city1Temp, city2Temp, isCity2Colder, stateChanged]);
    
    // Notify on state change
    if (stateChanged) {
      const message = isCity2Colder
        ? `🌡️ Temperature Inversion!\n${CITY_2} (${city2Temp}°F) is now colder than ${CITY_1} (${city1Temp}°F)\nTime: ${timestamp}`
        : `🌡️ Back to Normal\n${CITY_2} (${city2Temp}°F) is no longer colder than ${CITY_1} (${city1Temp}°F)\nTime: ${timestamp}`;
      
      sendSlackNotification(message);
    }
    
    properties.setProperty('city2Colder', isCity2Colder.toString());
    
  } catch (error) {
    Logger.log(`Error: ${error}`);
    sheet.appendRow([new Date().toLocaleString(), 'ERROR', error.toString()]);
  }
}

function getTemperature(city, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=imperial&appid=${apiKey}`;
  const response = UrlFetchApp.fetch(url);
  return JSON.parse(response.getContentText()).main.temp;
}

function createTrigger() {
  // Remove existing triggers
  ScriptApp.getProjectTriggers().forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Run every 10 minutes
  ScriptApp.newTrigger('checkWeather')
    .timeBased()
    .everyMinutes(10)
    .create();
}
