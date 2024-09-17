"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
//import neo4j from 'neo4j-driver'; // Import the Neo4j driver
import Link from 'next/link';
//import {fetchData} from "next-auth/client/_utils";
import {getVehicleHistory,deleteHistory,getLicenses} from "@/app/components/neo4jQueries";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';





/*
const neo4jUri = process.env.NEXT_PUBLIC_URL as string; // Neo4j server URI
const neo4jUser = process.env.NEXT_PUBLIC_U as string; // Neo4j username
const neo4jPassword = process.env.NEXT_PUBLIC_P as string; // Neo4j password

 */

//const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));


interface Item {
  description: string;
  mileage: number;
  category: string;
  action: string;
}

const columns = [
        {field: 'description', header: 'Description'},
        {field: 'mileage', header: 'Mileage'},
        {field: 'category', header: 'Category'},
        {field: 'action', header: 'Action'},
        {field: 'Actions', header: 'Actions'}
    ];

const App = () => {
  const {data: session, status} = useSession();
  const _email = session?.user?.email;
  const loading = status === 'loading';
  const [licenses, setLicenses] = useState<string[]>([]);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [data, setData] = useState<Item[]>([]);
  const [jsonData, setjsonData] = useState("");

  useEffect(() => {
    if (session?.user?.email && !loading) {

      const fetchLicenses = async () => {
        try {
          const result = await getLicenses(_email ?? '');

          if (result && result) {
            console.log(result);
          } else {
            console.error('Error fetching data:', result);
          }

          const licenses = result;
          console.log(result);

          setLicenses(licenses);
        } catch (error) {
          console.error('Error fetching licenses:', error);
        } finally {
          //session.close();
        }
      }

      fetchLicenses();
    }
  }, [session]);

  useEffect(() => {
    if (selectedLicense) {
      //const session = driver.session();

      const fetchData = async () => {
        try {
          /*
          const result = await session.run(`MATCH (v:Vehicle {license: $license})-[r:REPLACED|SERVICED]->(part)
      RETURN part.description AS Description,
             COALESCE(r.mileage, 0) AS Mileage,
             part.category AS Category,
             CASE WHEN TYPE(r) = 'REPLACED' THEN 'Replaced' ELSE 'Serviced' END AS Action`, { license: selectedLicense });

           */
          const result = await getVehicleHistory(selectedLicense);

          console.log('result.records:', result);
          const data = result;
          if (data.length === 0) {
            setData([]); // Clear the data state if the result set is empty
          } else {
            setData(data);
            setjsonData(JSON.stringify(data));
            console.log('table data : ', data);
            console.error(data);
            console.log('JSON data : ', jsonData);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          //session.close();
        }
      }

      fetchData();
    }
  }, [selectedLicense, loading, _email]);

  /*
  const handleDeleteItem = async (item: Item) => {
    if (confirm(`Are you sure you want to delete ${item.description} with mileage ${item.mileage}?`)) {
      console.log('handleDeleteItem called with item:', item);

      const mileageValue = Number(item.mileage) as number;

      console.log('Product Description : ', item.description);
      console.log('Mileage : ', mileageValue);
      console.log('License : ', selectedLicense);

      //const session = driver.session();

      try {
        console.log('Running delete query...');

        if (selectedLicense) {
          const result = await deleteHistory(selectedLicense, item.description, parseFloat(item.mileage.toString()));
          console.log(result);
          console.log('Delete query executed successfully.');
          window.location.reload();
        } else {

          console.log('nothing is selected.');
        }


        //MATCH (v:Vehicle {License: 'FBP1234T'})-[:REPLACEMENT_EVENT]->(p:Product {Name: 'Piston'})
        // DETACH DELETE p


      } catch (error) {
        console.error('Error deleting item:', error);
      } finally {
        //session.close();
      }
    }
  };

   */


  const handleDelete = async (rowData: Record<string, string | number>) => {
    // Implement your delete logic here (e.g., remove the item from the list)
    console.log(`Deleting item with ID ${rowData.id}, ${rowData.description}, ${rowData.mileage}`);
    if (confirm(`Are you sure you want to delete ${rowData.description} with mileage ${rowData.mileage}?`)) {

      try {
        console.log('Running delete query...');

        if (selectedLicense) {
          const result = await deleteHistory(selectedLicense, rowData.description.toString(), parseFloat(rowData.mileage.toString()));
          console.log(result);
          console.log('Delete query executed successfully.');
          window.location.reload();
        } else {

          console.log('nothing is selected.');
        }

      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const DeleteButton = ({onDelete}: { onDelete: () => void }) => {
    return (
        <button onClick={onDelete} className="p-button p-button-danger">
          Delete
        </button>
    );
  };

  return (
      <div>
        {loading ? (
            <ProgressSpinner aria-label="Loading..."/>
        ) : (
            <>
              <div>
                <select
                    value={selectedLicense || ''}
                    onChange={(e) => setSelectedLicense(e.target.value)}
                    style={{color: '#666'}}
                >
                  <option value="">Select a license</option>
                  {licenses.map((license) => (
                      <option key={license} value={license}>
                        {license}
                      </option>
                  ))}
                </select>
                <div/>
                <Link href="/addvehicle">
                  <button>Add Vehicle</button>
                </Link>

              </div>
              <DataTable value={data} tableStyle={{minWidth: '50rem'}}>
                {columns.map((col) => (
                    <Column
                        key={col.field}
                        field={col.field}
                        header={col.header}
                        body={(rowData) =>
                            col.field === 'Actions' ? (
                                <DeleteButton onDelete={() => handleDelete(rowData)}/>
                            ) : (
                                rowData[col.field]
                            )
                        }
                        sortable={col.field !== 'Actions'} // Disable sorting for the "Actions" column
                        style={{width: '25%'}}
                    />
                ))}
              </DataTable>
            </>
        )}


      </div>
  );
};

export default App;