#!/usr/bin/env node
const axios = require('axios');
const { printTable } = require('console-table-printer');
const readline = require('readline');
require('dotenv').config();

const apiKey = process.env.API_KEY;

// Create interface to read user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for flight number
function promptFlightNumber() {
  rl.question('Please enter a flight number: ', async (flightNumber) => {
    if (!flightNumber.trim()) {
      console.log('Flight number cannot be empty. Please try again.');
      promptFlightNumber(); // Prompt again
      return;
    }

    if (!/^[A-Z]{2}\d+$/i.test(flightNumber.trim())) {
      console.log('Invalid flight number format. Please enter a valid flight number.');
      promptFlightNumber(); // Prompt again
      return;
    }

    console.log('Fetching flight information...');
    try {
      const flightData = await fetchFlightInformation(flightNumber.toUpperCase());
      printFlightDetails(flightData);
    } catch (error) {
      console.error('Error fetching flight data:', error);
    } finally {
      rl.close();
    }
  });
}

promptFlightNumber();

async function fetchFlightInformation(flightNumber) {
  const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber.toUpperCase()}`;
  const response = await axios.get(apiUrl);
  if (response.data && response.data.data.length > 0) {
    return response.data.data[0];
  } else {
    throw new Error("Flight information currently unavailable.");
  }
}

function printFlightDetails(flightData) {
  const formattedData1 = [
    {
      'Flight Number': flightData.flight.iata || 'Unavailable',
      'Date': flightData.flight_date || 'Unavailable',
      'Status': flightData.flight_status || 'Unavailable',
    }
  ];

  const formattedData2 = [
    {
      'Departure Airport': flightData.departure.airport || 'Unavailable',
      'Arrival Airport': flightData.arrival.airport || 'Unavailable',
      'Airline': flightData.airline.name || 'Unavailable',
    }
  ];

  const formattedData3 = [
    {
      'Scheduled Departure Time': formatDate(flightData.departure.scheduled),
      'Actual Departure Time': formatDate(flightData.departure.actual),
    }
  ];

  const formattedData4 = [
    {
      'Scheduled Arrival Time': formatDate(flightData.arrival.scheduled),
      'Actual Arrival Time': formatDate(flightData.arrival.actual),
    }
  ];

  printTable(formattedData1);
  printTable(formattedData2);
  printTable(formattedData3);
  printTable(formattedData4);
}

function formatDate(dateString) {
  if (!dateString) return 'Unavailable';
  const date = new Date(dateString);
  const options = {
    timeZone: 'UTC',
    timeZoneName: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleString('en-US', options);
}
