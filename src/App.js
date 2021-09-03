// import './App.css';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';

import WeatherCard from './views/WeatherCard';
import { getMoment } from './utils/helpers';

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  }
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AUTHORIZATION_KEY = "CWB-9DB3B19C-35F5-40E4-9AE3-0C21C9ECB985";
const LOCATION_NAME = "新竹";
const LOCATION_NAME_FORECAST = "新竹市";

const fetchCurrentWeather = () => { //回傳Promise

  return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME}`)

    .then((response) => response.json())
    .then((data) => {
      // console.log('data', data) 
      const locationData = data.records.location[0];

      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (['WDSD', 'TEMP'].includes(item.elementName)) {
            neededElements[item.elementName] = item.elementValue;
          }
          return neededElements;
        }, {}
      )
      // console.log(weatherElements)

      // setWeatherElement((prevState) => (
      return {
        // ...prevState,
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        // description: '多雲時晴',
        // rainPossibility: 60,
        isLoading: false
      }
      // ))
    })
}

const fetchWeatherForecast = () => { //回傳Promise

  return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME_FORECAST}`)

    .then((response) => (response.json()))
    .then((data) => {
      // console.log(data)
      const locationData = data.records.location[0];

      const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {

        if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
          neededElements[item.elementName] = item.time[0].parameter;
        }
        return neededElements;
      }, {}
      )

      // setWeatherElement((prevState) => (
      return {
        // ...prevState,
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName
      }
      // ))
    })
}

function App() {
  console.log('invoke');
  const [currentTheme, setCurrentTheme] = useState('light');

  const [weatherElement, setWeatherElement] = useState({
    locationName: '',
    description: '',
    temperature: 0,
    windSpeed: 0,
    rainPossibility: 0,
    observationTime: new Date(),
    weatherCode: 0,
    comfortability: '',
    isLoading: true
  });

  const moment = useMemo(() => getMoment(LOCATION_NAME_FORECAST), []);

  const fetchData = useCallback(async () => {

    //透過傳入函式(複製前一份的資料，再把要更改的資料放在後面)，才不會覆蓋掉舊資料
    setWeatherElement((prevState) => ({ ...prevState, isLoading: true }));

    const [currentWeather, weatherForecast] = await Promise.all([fetchCurrentWeather(), fetchWeatherForecast()]);

    setWeatherElement({
      ...currentWeather,
      ...weatherForecast,
      isLoading: false
    })
  }, []) //回傳函式

  useEffect(() => {
    console.log('useEffect');

    fetchData();

  }, [fetchData])

  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'night')
  }, [moment])

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {console.log('render')}
        <WeatherCard weatherElement={weatherElement} moment={moment} fetchData={fetchData} />
      </Container>
    </ThemeProvider>
  );
}


export default App;
