"use client"

import React, { useState } from 'react';
import neo4j from 'neo4j-driver'; // Import the Neo4j driver
import neo4jDriver from "../components/neo4j";

const Page = () => {




  // State to manage form data
  const [formData, setFormData] = useState({
    name: '',
    mileage: '',
    lifespan: '',
    cost: '',
    category: '',
  });






  // State to manage update success/error
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Method to set error message
  const handleSetErrorMessage = (message) => {
    setErrorMessage(message);
  };

  // Handler for updating Neo4j database
  const handleUpdate = async () => {
    try {
      // Set up your Neo4j driver instance (replace with your own credentials)
      //const neo4jUri = process.env.NEO4J_URL; // Neo4j server URI
      //const neo4jUser = process.env.NEO4J_USERNAME; // Neo4j username
      //const neo4jPassword = process.env.NEO4J_PASSWORD; // Neo4j password

      const neo4jUri = process.env.NEXT_PUBLIC_URL; // Neo4j server URI
      const neo4jUser = process.env.NEXT_PUBLIC_U; // Neo4j username
      const neo4jPassword = process.env.NEXT_PUBLIC_P; // Neo4j password

      const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));
      //const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PWD));
      //const driver = await neo4jDriver();
      const session = driver.session();

      console.log("neo4j uri : ", neo4jUri);

      // Execute your modified Neo4j query
      await session.run(
        'CREATE (v:Vehicle {Make: "Aprilia", Model: "RS125", License: "FBE1624T"})\n' +
          '-[:_RELATED]->(r:Replacement {Mileage: $mileage})\n' +
          '-[:_RELATED]->(p:Product {Name: $name, Lifespan: $lifespan, Cost: $cost, Category: $category});',
        {
          name: formData.name,
          mileage: formData.mileage,
          lifespan: formData.lifespan,
          cost: formData.cost,
          category: formData.category,
        }
      );

      session.close();
      driver.close();

      // Handle success: Show confirmation message
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 5000); // Hide the message after 3 seconds
    } catch (error) {
      console.error('Error updating Neo4j:', error);
      handleSetErrorMessage(error.message);
      setUpdateError(true);
      setTimeout(() => {
        setUpdateError(false);
      }, 5000); // Hide the message after 3 seconds
    }
  };

  // Handler for form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    handleUpdate();
  };

  // Handler for form input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  if (updateError) {
    return <div>Error updating Neo4j: {errorMessage}</div>;
  }

  if (updateSuccess) {
    return <div>Update successful!</div>;
  }
  return (



          <div className="container">

        <h1>Update Neo4j Database</h1>
        <div className="form">
          <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
          />
          <input
              type="text"
              name="mileage"
              value={formData.mileage}
              onChange={handleInputChange}
              placeholder="Mileage"
          />
          <input
              type="text"
              name="lifespan"
              value={formData.lifespan}
              onChange={handleInputChange}
              placeholder="Lifespan"
          />
          <input
              type="text"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              placeholder="Cost"
          />
          <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="Category"
          />
          <button onClick={handleUpdate}>Update</button>
          {updateSuccess && <p className="success-message">Successfully updated!</p>}
          {updateError && <p className="error-message">Error updating Neo4j. Please try again.</p>}
        </div>
        <style jsx>{`
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }

          .form {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          input {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            color: #333; /* Darken the text color */
          }

          button {
            background-color: #0070f3;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 10px;
            cursor: pointer;
          }

          .success-message {
            color: green;
            font-size: 14px;
            margin-top: 10px;
          }

          .error-message {
            color: red;
            font-size: 14px;
            margin-top: 10px;
          }
        `}
        </style>
              </div>

  );
};

export default Page;
