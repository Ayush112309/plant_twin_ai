/**
 * PlantTwin AI — JavaScript / Node.js SDK
 */
class PlantTwinSDK {
  constructor(baseUrl = 'http://localhost:8000/api/v1', apiKey = null) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  async getHealth() {
    const res = await fetch(`${this.baseUrl}/health`);
    return res.json();
  }

  async ingestTelemetry(sensorId, tag, value) {
    const res = await fetch(`${this.baseUrl}/telemetry/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      },
      body: JSON.stringify({ sensor_id: sensorId, tag, value }),
    });
    return res.json();
  }
}

module.exports = { PlantTwinSDK };
