// import './App.css';
import React, { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';

import WeatherCard from './views/WeatherCard';
import WeatherSetting from './views/WeatherSetting'

import { getMoment, findLocation } from './utils/helpers';
import useWeatherAPI from './hooks/useWeatherAPI';

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

function App() {
  console.log('invoke');

  const storageCity = localStorage.getItem('cityName') || '臺北市'; //前面false就取後面

  const [currentCity, setCurrentCity] = useState(storageCity);

  const currentLocation = useMemo(() => findLocation(currentCity), [currentCity]);

  const { cityName, locationName, sunriseCityName } = currentLocation;

  const [weatherElement, fetchData] = useWeatherAPI({
    locationName,
    cityName,
    authorizationKey: AUTHORIZATION_KEY
  })

  const [currentTheme, setCurrentTheme] = useState('light');

  const moment = useMemo(() => getMoment(sunriseCityName), [sunriseCityName]);

  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark')
  }, [moment])

  const [currentPage, setCurrengePage] = useState('WeatherCard');

  const handleCurrentPageChange = (currentPage) => {
    setCurrengePage(currentPage);
  }

  const handleCurrentCityChange = (currentCity) => {
    setCurrentCity(currentCity);
  }

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {console.log('render')}

        {currentPage === 'WeatherCard' && (
          <WeatherCard weatherElement={weatherElement} moment={moment} fetchData={fetchData} handleCurrentPageChange={handleCurrentPageChange} cityName={cityName} />
        )}

        {currentPage === 'WeatherSetting' && (
          <WeatherSetting handleCurrentPageChange={handleCurrentPageChange} cityName={cityName} handleCurrentCityChange={handleCurrentCityChange} />
        )}

      </Container>
    </ThemeProvider>
  );
}


export default App;
