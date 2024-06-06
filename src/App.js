import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeliveryDashboard from './components/DeliveryDashboard';
import './App.css';
import { v4 as uuidv4 } from 'uuid';


const PORT = 5000;

function App() {
  const [deliveries, setDeliveries] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [formData, setFormData] = useState({
    minTemp: '',
    maxTemp: '',
    minHumidity: '',
    maxHumidity: '',
    productPrice: '',
    deliveryPrice: '',
    deliveryId: ''
  });
  const [simulationData, setSimulationData] = useState({
    avgTemp: '',
    avgHumidity: '',
    endTime: ''
  });

  useEffect(() => {
    fetchActiveDeliveries();
    fetchDeliveries();
  }, []);

  const fetchActiveDeliveries = () => {
    axios.get(`http://localhost:${PORT}/getActiveDeliveries`)
      .then(response => {
        setActiveDeliveries(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the active deliveries!', error);
      });
  };

  const fetchDeliveries = () => {
    axios.get(`http://localhost:${PORT}/getDeliveries`)
      .then(response => {
        setDeliveries(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the deliveries!', error);
      });
  };

  const getRandomEndTime = () => {
    let now = Date.now();
    return Math.floor(now / 1000);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSimulationInputChange = (e) => {
    const { name, value } = e.target;
    setSimulationData({
      ...simulationData,
      [name]: value
    });
  };

  const submitDelivery = (e) => {
    e.preventDefault();
    const updatedFormData = { ...formData, deliveryId: uuidv4() };
    axios.post(`http://localhost:${PORT}/initializeDelivery`, updatedFormData)
      .then(response => {
        console.log(response.data);
        setFormData({
          minTemp: '',
          maxTemp: '',
          minHumidity: '',
          maxHumidity: '',
          productPrice: '',
          deliveryPrice: '',
          deliveryId: ''
        });
        fetchActiveDeliveries();
        fetchDeliveries();
      })
      .catch(error => {
        console.error('There was an error submitting the delivery!', error);
      });
  };

  const simulateDelivery = (delivery) => {
    axios.post(`http://localhost:${PORT}/simulateDelivery`, {
      deliveryId: delivery.deliveryId,
      endTime: getRandomEndTime()
    })
      .then(response => {
        console.log(response.data);
        setSimulationData({
          avgTemp: '',
          avgHumidity: '',
          endTime: ''
        });
        fetchActiveDeliveries();
        fetchDeliveries();
      })
      .catch(error => {
        console.error('There was an error simulating the delivery!', error);
      });
  };

  return (
    <DeliveryDashboard
      formData={formData}
      handleInputChange={handleInputChange}
      submitDelivery={submitDelivery}
      simulationData={simulationData}
      handleSimulationInputChange={handleSimulationInputChange}
      simulateDelivery={simulateDelivery}
      deliveries={deliveries}
      activeDeliveries={activeDeliveries}
      selectedDelivery={selectedDelivery}
      setSelectedDelivery={setSelectedDelivery}
      fetchDeliveries={fetchDeliveries}
    />
  );
}

export default App;
