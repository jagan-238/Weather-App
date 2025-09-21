# Weather App with 5-Day Forecast and Google Maps Integration

## Overview
This is a **web application** built with **HTML, CSS, and JavaScript** that shows the current weather and a 5-day forecast for any location. It also displays the location on **Google Maps**. The app fetches weather data using the **OpenWeatherMap API** and integrates **Google Maps JavaScript API** for location visualization.

---

## Features

### 1. Location Access
- On page load, the app asks for **geolocation permission**.
- If granted, it shows the **current weather** for your location.
- If denied, users can **search for any city manually**.

### 2. Search Functionality
- Search box to enter **city name**.
- Fetches and displays **current weather** for the searched city.
- Updates **Google Map** location based on search.

### 3. Current Weather Display
Shows:
- Temperature
- Weather condition (sunny, rainy, cloudy, etc.)
- Humidity
- Wind speed
- Weather icon
- Sunrise and Sunset times (HH:MM:SS, local timezone)

### 4. 5-Day Forecast
- “5-Day Forecast” button redirects to a new page.
- Displays forecast for **next 5 days**:
  - Date
  - Minimum and maximum temperature
  - Weather condition
  - Weather icon

### 5. Google Maps Integration
- Shows the location of the current/searched city.
- Uses **Google Maps JavaScript API** with a dynamic marker for the city.

### 6. UI & Design
- Clean, responsive, and user-friendly interface.
- Weather details and map displayed side by side.
- Dynamic background changes depending on weather condition.
- Fully responsive for mobile and desktop.

---

## Project Structure
