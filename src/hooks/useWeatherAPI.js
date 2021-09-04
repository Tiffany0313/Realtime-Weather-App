import { useState, useEffect, useCallback } from "react";

const fetchCurrentWeather = ({ authorizationKey, locationName }) => { //回傳Promise

    return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&locationName=${locationName}`)

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

const fetchWeatherForecast = ({ authorizationKey, cityName }) => { //回傳Promise

    return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`)

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

const useWeatherAPI = ({ authorizationKey, cityName, locationName }) => {

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

    const fetchData = useCallback(async () => {

        //透過傳入函式(複製前一份的資料，再把要更改的資料放在後面)，才不會覆蓋掉舊資料
        setWeatherElement((prevState) => ({ ...prevState, isLoading: true }));

        const [currentWeather, weatherForecast] = await Promise.all([fetchCurrentWeather({ authorizationKey, locationName }), fetchWeatherForecast({ authorizationKey, cityName })]);

        setWeatherElement({
            ...currentWeather,
            ...weatherForecast,
            isLoading: false
        })

    }, [authorizationKey, cityName, locationName]) //回傳函式

    useEffect(() => {
        console.log('useEffect');

        fetchData();

    }, [fetchData])


    return [weatherElement, fetchData];
}

export default useWeatherAPI;