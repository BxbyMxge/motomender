"use client";

import React, { useEffect, useState } from 'react';
import neo4j from 'neo4j-driver'; // Import the Neo4j driver (make sure it's installed)
const Page = () => {
  //const [data, setData] = useState([]);// State to store the data fetched from Neo4j
  const [data, setData] = useState<{ productName: string; mileage: number }[]>([]);
  const handleDeleteItem = async (item: { productName: string; mileage: number }) => {
  console.log('handleDeleteItem called with item:', item);

  const neo4jUri = process.env.NEXT_PUBLIC_URL as string; // Neo4j server URI
  const neo4jUser = process.env.NEXT_PUBLIC_U as string; // Neo4j username
  const neo4jPassword = process.env.NEXT_PUBLIC_P as string; // Neo4j password
  const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));

  const session = driver.session();

  try {
    console.log('Running delete query...');

    /*
    await session.run(`
  MATCH (r:Replacement)-[rel:_RELATED]->(p:Product)
  WHERE p.Name = $productName AND r.Mileage = $mileage
  DELETE rel, r
`, { productName: item.productName, mileage: item.mileage });

     */

    await session.run(`
  MATCH (r:Replacement)-[rel:_RELATED]->(p:Product)
  WHERE p.Name = $productName AND r.Mileage = $mileage
  DELETE rel
`, { productName: item.productName, mileage: item.mileage });

await session.run(`
  MATCH (r:Replacement)--(p:Product {Name: $productName})
  WHERE r.Mileage = $mileage
  DELETE r
`, { productName: item.productName, mileage: item.mileage });

    console.log('Delete query executed successfully.');

    const result = await session.run(`
      MATCH (r:Replacement)-[:_RELATED]->(p:Product)
      RETURN p.Name AS productName, r.Mileage AS mileage
    `);

    console.log('Refetched data:', result);

    const data = result.records.map((record) => ({
      productName: record.get('productName').toString(),
      mileage: parseInt(record.get('mileage').toString()),
    }));

    console.log('Updated data:', data);

    setData(data);
  } catch (error) {
    console.error('Error deleting item:', error);
  } finally {
    session.close();
    driver.close();
  }
};

  useEffect(() => {
    const fetchData = async () => {
      const neo4jUri = process.env.NEXT_PUBLIC_URL as string; // Neo4j server URI
      const neo4jUser = process.env.NEXT_PUBLIC_U as string; // Neo4j username
      const neo4jPassword = process.env.NEXT_PUBLIC_P as string; // Neo4j password
      const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));

      const session = driver.session();

      try {
        const result = await session.run(`
          MATCH (r:Replacement)-[:_RELATED]->(p:Product)
          RETURN p.Name AS productName, r.Mileage AS mileage
        `);

        const data = result.records.map((record) => ({
          productName: record.get('productName').toString(),
          mileage: parseInt(record.get('mileage').toString()),
        }));

        setData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        session.close();
        driver.close();
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <table className="text-white bg-gray-800">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Mileage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td style={{
                textAlign: 'left',
                padding: '16px 24px',
                borderBottom: '1px solid #ddd',
                color: '#333',
              }}>
                {item.productName}
              </td>
              <td style={{
                textAlign: 'left',
                padding: '16px 24px',
                borderBottom: '1px solid #ddd',
                color: '#333',
              }}>
                {item.mileage}
              </td>
              <td style={{
                textAlign: 'left',
                padding: '16px 24px',
                borderBottom: '1px solid #ddd',
                color: '#333',
              }}>
                <button
                  style={{
                    backgroundColor: '#ff0000',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleDeleteItem(item)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;