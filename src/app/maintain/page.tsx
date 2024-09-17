"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getDescriptions, getMileage, createService, createRepair, getLicenses } from "@/app/components/neo4jQueries";
import { Button } from '@nextui-org/button';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { Input } from "@nextui-org/react";



const NewPage = () => {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    vehicle: '',
    description: '',
    action: '',
    lifespan: '',
    cost: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  //const [vehicles, setVehicles] = useState([]);
  const [vehicles, setVehicles] = useState<string[]>([]);

  //const [descriptions, setDescriptions] = useState([]);
  const [ descriptions,setDescriptions] = useState<{ value: string; label: string }[]>([]);
  //const [mileage, setMileage] = useState(null);
  //const [mileage, setMileage] = useState<number | null>(null);
  const [ mileage, setMileage] = useState<number[] | null>(null);

  console.log(descriptions,mileage);

  //For categories
  const categories = [
  { id: 0, name: 'Select Category' },
  { id: 1, name: 'ACCESORIES' },
  { id: 2, name: 'AIR & FUEL' },
  { id: 3, name: 'AUDIO & SPEAKERS' },
  { id: 4, name: 'BIKE PROTECTION' },
  { id: 5, name: 'BODY, FAIRING & FENDER' },
  { id: 6, name: 'BRAKES' },
  { id: 7, name: 'DASH & GAUGES' },
  { id: 8, name: 'DRIVE & TRANSMISSION' },
  { id: 9, name: 'ELECTRICAL' },
  { id: 10, name: 'ENGINE' },
  { id: 11, name: 'EXHAUST' },
  { id: 12, name: 'FILTERS' },
  { id: 13, name: 'FOOT CONTROLS' },
  { id: 14, name: 'HANDLEBARS & CONTROLS' },
  { id: 15, name: 'LIGHTING' },
  { id: 16, name: 'MIRRORS' },
  { id: 17, name: 'SUSPENSION & FRAME' },
  { id: 18, name: 'TIRES' },
  { id: 19, name: 'WHEEL & AXLE' },
  { id: 20, name: 'WINDSHIELDS & WINDSCREENS' },
]

const [selectedCategory, setSelectedCategory] = useState(categories[0])


  useEffect(() => {
    const fetchDescriptions = async () => {
      const data = await getDescriptions();
      setDescriptions(data.map((description) => ({ value: description, label: description })));
    };
    fetchDescriptions();
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      const email = session?.user?.email;
      const fetchVehicles = async () => {
        const vehicles = await getLicenses(email ?? '');
        setVehicles(vehicles);
      };
      fetchVehicles();
    }
  }, [session, status]);

  const handleActionChange = (action: string) => {
    setFormData({ ...formData, action });
  };

  /*
  const handleDescriptionChange = (description: string) => {
    setFormData({ ...formData, description });
  };

   */

  const handleVehicleChange = (vehicle: string) => {
    setFormData({ ...formData, vehicle });
    getMileage(vehicle).then((mileage) => {
      setMileage(mileage);
    });
  };

  const handleSubmit = async () => {

    //get current mileage
    const _currMileage = Number(await getMileage(formData.vehicle)) ?? 0;



    if (selectedCategory.id === 0) { console.log('please select a category'); alert('please select a category');return;}
    if (formData.action === '') { console.log('please select an action'); alert('please select an action');return;}


    const products = [
  {
    description: formData.description,
    lifespan: Number(formData.lifespan) ?? 0,
    cost: Number(formData.cost) ?? 0,
    category: selectedCategory.name,
  },
];

    const license = formData.vehicle;

    console.log('Selected License : ',formData.vehicle);
    console.log('Current Mileage : ',_currMileage);

    console.log("Selected Category : ",selectedCategory.name);
    console.log("Selected Action : ",formData.action);
    console.log("Products : ",products);


    /*
    if (formData.action === 'SERVICE') {
      await createService(license, _currMileage, products);
    } else if (formData.action === 'REPLACEMENT') {
      await createRepair(license, _currMileage, products);
    }

     */

    setIsSubmitting(true);
    try{

      if (formData.action === 'SERVICE') {
        await createService(license, _currMileage, products[0]);
        setIsSubmitting(false);
        setFormData({
          vehicle: '',
          description: '',
          action: '',
          lifespan: '',
          cost: '',
        });
      }else if (formData.action === 'REPLACEMENT') {
        await createRepair(license, _currMileage, products);
        setIsSubmitting(false);
        setFormData({
          vehicle: '',
          description: '',
          action: '',
          lifespan: '',
          cost: '',
        });
        alert('record created successfully');
      }


    }catch (error) {
      console.log(error);
      alert(error);
      setIsSubmitting(false);
    }


  };

    return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New Maintainence</h1>
      <form>
        <div className="mb-4">
          <label htmlFor="vehicle" className="block font-medium">
            Vehicle:
          </label>
          <select
              id="vehicle"
              value={formData.vehicle}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="w-full p-2 border rounded text-black"
          >
            <option value="" disabled>
              Select Vehicle
            </option>
            {vehicles.map((vehicle) => (
                <option key={vehicle} value={vehicle}>
                  {vehicle}
                </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block font-medium">
            Description:
          </label>
          <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full"
              placeholder="Search a description"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="lifespan" className="block font-medium">
            Lifespan:
          </label>
          <input
              type="number"
              id="lifespan"
              value={formData.lifespan}
              onChange={(e) => setFormData({...formData, lifespan: e.target.value})}
              className="w-full p-2 border rounded text-black"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="cost" className="block font-medium">
            Cost:
          </label>
          <input
              type="number"
              id="cost"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
              className="w-full p-2 border rounded text-black"
          />
        </div>


        <div className="mb-4">
          <label htmlFor="cost" className="block font-medium">
            Category:
          </label>
          <Listbox value={selectedCategory} onChange={setSelectedCategory}>
            <ListboxButton className="w-full p-2 border rounded text-black bg-white">
              {selectedCategory.name}
            </ListboxButton>
            <ListboxOptions anchor="bottom" className="bg-white border rounded">
              {categories.map((category) => (
                  <ListboxOption key={category.id} value={category} disabled={category.id === 0}
                                 className="p-2 text-black hover:bg-gray-100">
                    {category.name}
                  </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>
        </div>


        <div className="mb-4">
          <label htmlFor="action" className="block font-medium">
            Action:
          </label>
          <Listbox value={formData.action} onChange={handleActionChange}>
            <ListboxButton className="w-full p-2 border rounded text-black bg-white">
              {formData.action === "" ? "Select Action" : formData.action}
            </ListboxButton>
            <ListboxOptions anchor="bottom" className="bg-white border rounded">
              <ListboxOption value="" disabled className="p-2 text-black">
                Select Action
              </ListboxOption>
              <ListboxOption value="SERVICE" className="p-2 text-black hover:bg-gray-100">
                SERVICE
              </ListboxOption>
              <ListboxOption value="REPLACEMENT" className="p-2 text-black hover:bg-gray-100">
                REPLACEMENT
              </ListboxOption>
            </ListboxOptions>
          </Listbox>
        </div>

        <Button color="primary" onClick={handleSubmit} isLoading={isSubmitting}>
          {isSubmitting ? 'Updating' : 'Submit'}
        </Button>
      </form>
    </div>
    );
};

export default NewPage;