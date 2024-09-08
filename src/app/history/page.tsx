"use client";

import React, { useEffect, useState } from 'react';
import neo4j from 'neo4j-driver'; // Import the Neo4j driver (make sure it's installed)



    //const driver = neo4j.driver('neo4j+s://7de5ae45.databases.neo4j.io', neo4j.auth.basic('neo4j', 'xggBuS3O66Ym5_DuiyrGSOXoWQic88gQJiZ-odO64SY'));
    //const session = driver.session();

const Page = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {

              const neo4jUri = process.env.NEXT_PUBLIC_URL; // Neo4j server URI
      const neo4jUser = process.env.NEXT_PUBLIC_U; // Neo4j username
      const neo4jPassword = process.env.NEXT_PUBLIC_P; // Neo4j password

      const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));

      const session = driver.session();

      try {
        const result = await session.run(`
          MATCH (r:Replacement)-[:_RELATED]->(p:Product)
          RETURN p.Name AS productName, r.Mileage AS mileage
          ORDER BY r.Mileage DESC
        `);

        const processedData = result.records.map((record) => ({
          productName: record.get('productName'),
          mileage: typeof record.get('mileage') === 'object' ? record.get('mileage').low : record.get('mileage'),
        }));

        setData(processedData);
      } catch (error) {
        console.error('Error fetching data from Neo4j:', error);
      } finally {
        session.close();
        driver.close();
      }
    };

    fetchData();
  }, []);

 return (
     <div>
      <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', color: '#333', marginBottom: '16px' }}>Replacement Details</h1>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <thead>
            <tr>
              <th style={{
                textAlign: 'left',
                padding: '16px 24px',
                borderBottom: '1px solid #ddd',
                backgroundColor: '#f7f7f7',
                color: '#333',
                fontWeight: '600',
              }}>
                Product Name
              </th>
              <th style={{
                textAlign: 'left',
                padding: '16px 24px',
                borderBottom: '1px solid #ddd',
                backgroundColor: '#f7f7f7',
                color: '#333',
                fontWeight: '600',
              }}>
                Mileage
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.productName}
                style={{
                  transition: 'background-color 0.3s',
                  ':hover': {
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer',
                  },
                }}
              >
                <td style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #ddd',
                  color: '#666',
                }}>
                  {item.productName}
                </td>
                <td style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #ddd',
                  color: '#666',
                }}>
                  {item.mileage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default Page;