from flask import Flask, render_template, request, jsonify
import requests, datetime

app = Flask(__name__)
API_KEY = "d7f1b86d6530ac88b540ef61805332de"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/weather")
def weather():
    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if city:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    elif lat and lon:
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    else:
        return jsonify({"error": "No city or location provided"})

    current = requests.get(url).json()
    if current.get("cod") != 200:
        return jsonify({"error": current.get("message", "City not found")})

    # 5-day forecast
    forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={current['name']}&appid={API_KEY}&units=metric"
    forecast_data = requests.get(forecast_url).json()

    forecast_list = []
    for i in range(0, len(forecast_data["list"]), 8):
        day = forecast_data["list"][i]
        forecast_list.append({
            "date": day["dt_txt"].split(" ")[0],
            "temp": day["main"]["temp"]
        })

    # Hourly next 12 hours
    hourly_list = []
    for h in forecast_data["list"][:12]:
        hourly_list.append({
            "time": h["dt_txt"].split(" ")[1][:5],
            "temp": h["main"]["temp"]
        })

    # Format sunrise/sunset
    sunrise = datetime.datetime.fromtimestamp(current["sys"]["sunrise"]).strftime("%H:%M")
    sunset = datetime.datetime.fromtimestamp(current["sys"]["sunset"]).strftime("%H:%M")

    data = {
        "city": current["name"],
        "country": current["sys"]["country"],
        "temp": current["main"]["temp"],
        "feels_like": current["main"]["feels_like"],
        "description": current["weather"][0]["description"].capitalize(),
        "main": current["weather"][0]["main"],
        "icon": current["weather"][0]["icon"],
        "humidity": current["main"]["humidity"],
        "pressure": current["main"]["pressure"],
        "wind": current["wind"]["speed"],
        "visibility": current["visibility"],
        "sunrise": sunrise,
        "sunset": sunset,
        "forecast": forecast_list,
        "hourly": hourly_list
    }
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

