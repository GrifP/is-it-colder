# is-it-colder?

A Google Apps Script that monitors temperature differences between two cities and sends Slack notifications when one becomes colder than the other.

**Default cities:** Phoenix, AZ vs. Boston, MA

## Features
- Checks temperatures every 10 minutes using OpenWeather API
- Logs temperature data to Google Sheets
- Sends Slack notifications only when the temperature relationship changes
- Configurable cities without code changes

## Setup

### 1. Create a Google Sheet

Create a new Google Sheet where temperature data will be logged.

### 2. Add the Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. Paste the code from `Code.gs`
4. Save the project (name it whatever you want)

### 3. Get API Keys

#### OpenWeather API Key
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Go to your API keys section
3. Copy your API key (free tier allows 1,000 calls/day)

#### Slack Webhook URL
1. Go to [Slack API: Incoming Webhooks](https://api.slack.com/messaging/webhooks)
2. Create a new webhook for your workspace
3. Select the channel where notifications should be posted
4. Copy the webhook URL

### 4. Configure Script Properties

1. In the Apps Script editor, click the **Settings** icon (⚙️) in the left sidebar
2. Scroll to **Script Properties**
3. Add the following properties:

### 5. Run Initial Setup

1. In the Apps Script editor, select `createTrigger` from the function dropdown
2. Click **Run** (▶️)
3. Grant necessary permissions when prompted
4. This creates a time-based trigger to run every 10 minutes

### 6. Test It

1. Select `checkWeather` from the function dropdown
2. Click **Run**
3. Check your Google Sheet for a new row with temperature data
4. If this is the first run, no Slack message will be sent (needs a state change)

## Customizing Cities

To monitor different cities, add/update these Script Properties:

- `CITY_1`: The reference city (e.g., "New York", "London", "Tokyo")
- `CITY_2`: The comparison city (e.g., "Miami", "Paris", "Sydney")

**Note:** City names should match OpenWeather's city database. For cities with common names, try adding state/country: "Portland,OR,US" or "Portland,UK"

## How It Works

1. Every 10 minutes, the script fetches current temperatures for both cities
2. It logs the data to your Google Sheet
3. It compares the current state (is City 2 colder?) with the previous state
4. If the relationship has changed, it sends a Slack notification
5. The new state is saved for the next comparison

## Rate Limits

- **OpenWeather Free Tier:** 1,000 calls/day
- **This script:** ~144 calls/day (one per city, every 10 minutes)
- **Headroom:** ~712 calls/day remaining for other uses or shorter intervals
