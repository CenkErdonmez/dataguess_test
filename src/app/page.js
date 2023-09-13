"use client";
import React, { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, gql, useQuery } from "@apollo/client";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://countries.trevorblades.com",
});

const LIST_COUNTRIES = gql`
  {
    countries {
      code
      name
      currency
      languages {
        name
        native
      }
    }
  }
`;

const availableColors = ["#FF5733", "#33FF57", "#5733FF", "#FF33F6"];

export default function Home() {
  const { data, loading, error } = useQuery(LIST_COUNTRIES, { client });
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState("");
  const [groupField, setGroupField] = useState("");
  const [groupedCountries, setGroupedCountries] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  useEffect(() => {
    if (data && data.countries) {
      const filteredCountries = data.countries.filter((country) => {
        const searchString = filter.toLowerCase();
        return (
          country?.name?.toLowerCase().includes(searchString) ||
          country?.currency?.toLowerCase().includes(searchString) ||
          country?.languages.some(
            (lang) =>
              lang.name.toLowerCase().includes(searchString) ||
              lang.native.toLowerCase().includes(searchString)
          )
        );
      });

      const grouped = {};

      if (groupField) {
        filteredCountries.forEach((country) => {
          const key = country[groupField] || "Ungrouped";
          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(country);
        });
      } else {
        grouped["All"] = filteredCountries;
      }

      setGroupedCountries(grouped);
      if (filteredCountries.length > 0) {
        const newIndex =
          filteredCountries.length >= 10 ? 9 : filteredCountries.length - 1;
        setSelectedItem(filteredCountries[newIndex]);
        setSelectedColorIndex(newIndex % availableColors.length);
      }
    }
  }, [data, filter, groupField]);

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
    const searchMatch = inputValue.match(/search:\s*(\w*)/i);
    const groupMatch = inputValue.match(/group:\s*(\w*)/i);

    setFilter(searchMatch ? searchMatch[1].toLowerCase() : "");
    setGroupField(groupMatch ? groupMatch[1].toLowerCase() : "");
  };

  const handleItemClick = (country) => {
    setSelectedItem(country);
    setSelectedColorIndex(
      (prevIndex) => (prevIndex + 1) % availableColors.length
    );
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-start lg:p-24 p-4'>
      <div>
        <p className='p-4 lg:text-lg text-sm font-bold'>
          Search like this <span className='text-red-300'>search: tt</span> and
          group them by code, name, currency and languages
        </p>
      </div>
      <div className='lg:max-w-[20vw] w-full'>
        <input
          className=' py-4 px-2 w-full  text-sm font-medium text-gray-900 border-4 border-black border-solid rounded-md hover:bg-black hover:text-white'
          type='text'
          placeholder="Enter 'search: tt group: code'"
          value={inputValue}
          onChange={handleInputChange}
        />
        {loading || error ? (
          <p>{error ? error.message : "Loading..."}</p>
        ) : (
          <div className='drop-shadow-sm bg-gray-50 px-2 '>
            {Object.keys(groupedCountries).map((group) => (
              <div className='flex flex-col gap-4 py-2 ' key={group}>
                <ul>
                  {groupedCountries[group].map((country) => (
                    <li
                      className='hover:text-red-500 drop-shadow-md px-2 rounded'
                      key={country.code}
                      onClick={() => handleItemClick(country)}
                      style={{
                        backgroundColor:
                          selectedItem === country
                            ? availableColors[selectedColorIndex]
                            : "",
                        cursor: "pointer",
                      }}
                    >
                      {country.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
