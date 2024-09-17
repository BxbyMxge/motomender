"use client";
import {Autocomplete, AutocompleteItem, Input, Button } from "@nextui-org/react";
import React, { useState, useEffect } from "react";
//import { getAllMake, getYearsByBrand,getMakeByBrandAndYear } from "@/app/components/neo4jQueries";
import { getAllMake, getYearsByBrand, getMakeByBrandAndYear, addMotorbike} from "../components/neo4jQueries";
import { useSession } from 'next-auth/react';




// Your function that returns an array of brands (makes)
const getBrands = async () => {
  // Replace this with your actual logic to fetch brands
  // For now, let's assume you have an array like this:
  //return ["Honda", "Yamaha", "Kawasaki", /* ... */];
  return await getAllMake();

};

// Function to fetch years based on the selected make
const getYearsForMake = async (selectedMake) => {
  // Replace this with your logic to fetch years for the selected make
  // For now, let's assume you have an array of years like this:
    console.log("selected : ",selectedMake);
    return await getYearsByBrand(selectedMake);
  //return [2020, 2021, 2022, /* ... */];
  //return _years;
};



export default function App() {
    const [brandList, setBrandList] = useState([]);
    const [selectedMake, setSelectedMake] = useState(""); // Track the selected make
    const [selectedYear, setSelectedYear] = useState(0); // Track the selected year
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedModel, setSelectedModel] = useState(""); // Track the selected model
    const [modelList, setModelList] = useState([]);
    const [yearList, setYearList] = useState([]);
    const [license, setLicense] = useState('');
    const [currentMileage, setCurrentMileage] = useState(0);
    const { data: session } = useSession();





    useEffect(() => {
        getBrands()
            .then((brands) => {
                setBrandList(brands);
            })
            .catch((error) => {
                console.error("Error fetching brands:", error);
            });
    }, []);

    useEffect(() => {
        console.log("Selected make:", selectedMake);
        // Fetch years for the selected make and update the state
        if (selectedMake) {
            getYearsForMake(selectedMake)
                .then((years) => {
                    setYearList(years);
                })
                .catch((error) => {
                    console.error("Error fetching years:", error);
                });
        }
    }, [selectedMake]);


    useEffect(() => {
        console.log("[model_useEffect]Selected make:", selectedMake);
        console.log("[model_useEffect]selected year : ", selectedYear);
        // Fetch model for the selected make and year and update the state
        if (selectedMake && selectedYear) {
            getMakeByBrandAndYear(selectedMake, selectedYear)
                .then((models) => {
                    setModelList(models);
                    console.log(modelList);
                })
                .catch((error) => {
                    console.error("Error fetching years:", error);
                });
        }
    }, [selectedMake, selectedYear]);


    const handleMakeSelectionChange = async (selectedMake) => {
        console.log('[][][]handleMakeSelectionChange called with make:', selectedMake);
        setSelectedMake(selectedMake);

        //populate Year List
        const years = await getYearsByBrand(selectedMake);
        console.log("updated years for brand : {0} : {1}", selectedMake, years);
        setYearList(years);


    }
    const handleYearSelectionChange = async (selectedYear) => {
        console.log('[][][]handleMakeSelectionChange called with year:', selectedYear);
        setSelectedYear(selectedYear);


    }
    const handleModelSelectionChange = async (selectedModel) => {
        console.log('[][][]handleMakeSelectionChange called with model:', selectedModel);
        const x = selectedModel;
        console.log(x);
        setSelectedModel(selectedModel);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log("[][][][][][][][][][][][][][]",selectedMake, selectedModel, license, currentMileage);
        if(!selectedMake || !selectedModel || !license || !selectedYear){
            alert('Please fill in all required fields!')
            return;
        }

        try {
            console.log('[][][][][] Form is trying to submit still...');
            await addMotorbike(session.user.email, selectedMake, selectedModel, license, currentMileage,selectedYear);
            setMake('');
            setModel('');
            setLicense('');
            setCurrentMileage('');
            alert('Vehicle added successfully!');
        } catch (error) {
            alert('Error adding vehicle: ' + error.message)
        }
    };
    if (!session) {
    return <div>You must be logged in to add a vehicle.</div>;
  }



    return (
        <div>


            <h2 className="text-lg font-bold mb-4 text-gray-800">Add Vehicle</h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                {/* First Autocomplete for makes */}
                <Autocomplete
                    defaultItems={brandList.map((brand) => ({label: brand, value: brand}))}
                    label="Make"
                    placeholder="Search for a Maker"
                    className="max-w-xs text-black"
                    onSelectionChange={(make) => {
                        console.log('onSelect called with make:', make);
                        handleMakeSelectionChange(make);
                    }}
                >
                    {(brand) => <AutocompleteItem key={brand.value}
                                                  style={{color: "black"}}>{brand.label}</AutocompleteItem>}
                </Autocomplete>

                {/* Second Autocomplete for year */}
                <Autocomplete
                    defaultItems={yearList.map((year) => ({label: year.toString(), value: year}))}
                    label="Select Year"
                    placeholder="Choose a year"
                    className="max-w-xs text-black"
                    disabled={!selectedMake}
                    onSelectionChange={(_year) => {
                        console.log('onSelect called with make:', _year);
                        handleYearSelectionChange(_year);
                    }}
                >
                    {(year) => <AutocompleteItem key={year.value}
                                                 style={{color: "black"}}>{year.label}</AutocompleteItem>}
                </Autocomplete>


                {/*Autocomplete for model*/}
                <Autocomplete
                    defaultItems={modelList.map((model) => ({label: model.toString(), value: model}))}
                    label="Select Model"
                    placeholder="Choose a Model"
                    className="max-w-xs text-black"
                    disabled={!selectedMake}
                    onSelectionChange={(_model) => {
                        console.log('onSelect called with make:', _model);
                        handleModelSelectionChange(_model);
                    }}
                >
                    {(year) => <AutocompleteItem key={year.value}
                                                 style={{color: "black"}}>{year.label}</AutocompleteItem>}
                </Autocomplete>
                <Input
                    label="License"
                    id="license"
                    value={license}
                    onChange={(event) => setLicense(event.target.value)}
                />
                <Input
                    label="Current Mileage"
                    id="currentMileage"
                    type="number"
                    value={currentMileage}
                    onChange={(event) => setCurrentMileage(parseFloat(event.target.value))}
                />
                <Button type="submit" color="primary">
                    Add Vehicle
                </Button>
            </form>



        </div>
    );
}
