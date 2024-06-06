import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Modal from 'react-modal';
import 'chart.js/auto';

Modal.setAppElement('#root'); // Set the app element for accessibility

function DeliveryDashboard({
  formData,
  handleInputChange,
  submitDelivery,
  simulateDelivery,
  deliveries,
  activeDeliveries,
  selectedDelivery,
  setSelectedDelivery
}) {
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [sensorData, setSensorData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avgTemp, setAvgTemp] = useState(0);
  const [avgHumidity, setAvgHumidity] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleDeliveryClick = async (delivery) => {
    setSelectedDelivery(delivery);

    if (['rejected', 'accepted'].includes(delivery.status)) {
      const response = await fetch(`http://localhost:5000/getSensorData/${delivery.deliveryId}`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      setSensorData(data);

      // Calculate average temperature and humidity
      const avgTemp = data.reduce((sum, d) => sum + d.temperature, 0) / data.length;
      const avgHumidity = data.reduce((sum, d) => sum + d.humidity, 0) / data.length;
      setAvgTemp(avgTemp.toFixed(2));
      setAvgHumidity(avgHumidity.toFixed(2));

      setIsModalOpen(true); // Open the modal
    } else {
      setSensorData(null);
      setIsModalOpen(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'rejected':
        return 'status-red';
      case 'draft':
        return 'status-yellow';
      case 'accepted':
        return 'status-green';
      default:
        return '';
    }
  };

  const formatEndTime = (seconds) => {
    const date = new Date(seconds * 1000);
    return date.toLocaleString();
  };

  const renderChart = (data) => {
    const timeLabels = data.map((_, index) => `time${index + 1}`);
    const temperatureData = data.map(d => d.temperature);
    const humidityData = data.map(d => d.humidity);

    const chartData = {
      labels: timeLabels,
      datasets: [
        {
          label: 'Temperature',
          data: temperatureData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        },
        {
          label: 'Humidity',
          data: humidityData,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        },
      ],
    };

    return <Line data={chartData} />;
  };

  return (
    <div>
      <header className="App-header">
        <h1>Delivery Dashboard</h1>
      </header>
      <main>
        <div>
          <h2>Submit New Delivery</h2>
          <form onSubmit={submitDelivery}>
            <input
              type="number"
              name="minTemp"
              placeholder="Min Temperature"
              value={formData.minTemp}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="maxTemp"
              placeholder="Max Temperature"
              value={formData.maxTemp}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="minHumidity"
              placeholder="Min Humidity"
              value={formData.minHumidity}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="maxHumidity"
              placeholder="Max Humidity"
              value={formData.maxHumidity}
              onChange={handleInputChange}
            />
            <input
              type="number"
              step=".01"
              name="productPrice"
              placeholder="Product Price"
              value={formData.productPrice}
              onChange={handleInputChange}
            />
            <input
              type="number"
              step=".01"
              name="deliveryPrice"
              placeholder="Delivery Price"
              value={formData.deliveryPrice}
              onChange={handleInputChange}
            />
            <button type="submit">Submit</button>
          </form>
        </div>

        <div>
          <h2>Active Deliveries</h2>
          <ul>
            {activeDeliveries.map((delivery) => (
              <li key={delivery.deliveryId}>
                {delivery.deliveryId} - {delivery.status}
                <button onClick={() => simulateDelivery(delivery)}>Deliver</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="table-container">
          <h2>All Deliveries</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Product Price</th>
                <th>Delivery Price</th>
                <th>Min Temp</th>
                <th>Max Temp</th>
                <th>Min Humidity</th>
                <th>Max Humidity</th>
                <th>Avg Temp</th>
                <th>Avg Humidity</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr
                  key={delivery.deliveryId}
                  className={getStatusClass(delivery.status)}
                  onClick={() => handleDeliveryClick(delivery)}
                >
                  <td className="ellipsis">{delivery.deliveryId}</td>
                  <td>{delivery.status}</td>
                  <td>{delivery.productPrice}</td>
                  <td>{delivery.deliveryPrice}</td>
                  <td>{delivery.minTemp}</td>
                  <td>{delivery.maxTemp}</td>
                  <td>{delivery.minHumidity}</td>
                  <td>{delivery.maxHumidity}</td>
                  <td>{delivery.avgTemp}</td>
                  <td>{delivery.avgHumidity}</td>
                  <td>{formatEndTime(delivery.endTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Sensor Data"
        >
          <h2>Sensor Data for Delivery {selectedDelivery?.deliveryId}</h2>
          {sensorData && renderChart(sensorData)}
          <p>Average Temperature: {avgTemp}°C</p>
          <p>Average Humidity: {avgHumidity}%</p>
          <button
            style={{
              backgroundColor: '#f44336', /* Red */
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '14px',
              margin: '4px 2px',
              cursor: 'pointer',
              borderRadius: '12px',
            }}
            onClick={() => setIsModalOpen(false)}>Close</button>
        </Modal>

        <div>
          <h2>Current Time</h2>
          <p>{formatEndTime(currentTime)}</p>
        </div>
      </main>
    </div>
  );
}

export default DeliveryDashboard;
