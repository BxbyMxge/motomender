"use server";

// neo4jQueries.ts
import neo4j from 'neo4j-driver';
import * as Console from "node:console";

const neo4jUri = process.env.NEO4J_URL as string;
const neo4jUser = process.env.NEO4J_USERNAME as string;
const neo4jPassword = process.env.NEO4J_PASSWORD as string;

const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));

export async function createUser(name: string, email: string) {
  const session = driver.session();
  try {
    const result = await session.run(
      'CREATE (:User {Name: $name, Email: $email}) RETURN *',
      { name, email }
    );
    return result.records[0].get('User').properties;
  } finally {
    await session.close();
  }
}

export async function addVehicle(email: string, make: string, model: string, license: string, currentMileage: number) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
        MATCH (u:User {email: $email})
CREATE (v:Vehicle {license: $license, make: $make, model: $model, currentMileage: $currentMileage})
CREATE (u)-[:OWNS]->(v)
      `,
      { email, make, model, license, currentMileage }
    );
    return result.records;
  } finally {
    await session.close();
  }}

export async function addMotorbike(email: string, make: string, model: string, license: string, currentMileage: number, year: number) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
        MATCH (u:User {email: $email})
CREATE (v:Vehicle {license: $license, currentMileage: toFloat($currentMileage)})
CREATE (u)-[:OWNS]->(v)
WITH v
MATCH (m:Motorbike {make: $make, model: $model, year: toFloat($year)})
CREATE (v)-[:CORRESPONDS_TO]->(m)
RETURN v
      `,
      { email, make, model, license, currentMileage,year }
    );
    return result.records.toString();
  } finally {
    await session.close();
  }}

export async function deleteVehicle(license: string) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
        MATCH (v:Vehicle {license: $license})
        DETACH DELETE v
      `,
      { license }
    );
    return result.summary;
  } finally {
    await session.close();
  }
}

export async function modifyVehicle(license: string, make: string, model: string, mileage: number) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
        MATCH (v:Vehicle {license: $license})
        SET v.make = $make,
        v.model = $model,
        v.currentMileage = $mileage
      `,
      { license, make, model, mileage }
    );
    return result.summary;
  } finally {
    await session.close();
  }
}



export async function getUserByEmail(email: string) {
  const session = driver.session();
  try {
    const result = await session.run(`MATCH (u:User {email: '${email}'}) RETURN u`);
    return result.records[0].get('u').properties;
  } finally {
    await session.close();
  }
}

export async function createRepair(license: string, mileage: number, products: { description: string, lifespan: number, cost: number, category: string }[]) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
        MATCH (v:Vehicle {license: $license})
        UNWIND $products as product
        CREATE (p:Part {description: product.description, category: product.category, expectedLifespan: product.lifespan, cost: product.cost})<-[:REPLACED {mileage: $mileage}]-(v)
      `,
      { license, mileage, products }
    );
    return result.records;
  } finally {
    await session.close();
  }
}
export async function createService(license: string, mileage: number, product: { description: string, lifespan: number, cost: number, category: string }) {
  const session = driver.session();
  try {
    console.log("Product in query : ", product);
    const result = await session.run(
      `
        MATCH (v:Vehicle {license: $license})
CREATE (p:Part {description: $product.description, category: $product.category, expectedLifespan: $product.lifespan, cost: $product.cost})<-[:SERVICED {mileage: $mileage}]-(v)
      `,
      { license, mileage, product }
    );
    console.log(result.summary.query);
    console.log(result.summary.queryType);
    return result.records;
  } finally {
    await session.close();
  }
}
export async function getVehicleHistory(license: string) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
        MATCH (v:Vehicle {license: $license})-[r:REPLACED|SERVICED]->(part)
        RETURN part.description AS Description,
        COALESCE(r.mileage, 0) AS Mileage,
        part.category AS Category,
        CASE WHEN TYPE(r) = 'REPLACED' THEN 'Replaced' ELSE 'Serviced' END AS Action
      `,
      { license }
    );
    //return result;
    return result.records.map((record) => ({
  description: record.get('Description'),
  mileage: record.get('Mileage').toString(),
  category: record.get('Category'),
  action: record.get('Action'),
}));


  } finally {
    await session.close();
  }

}


export async function deleteHistory(license: string, description: string, mileage: number) {
  const session = driver.session();
  try {

    Console.log('[][][][][] We are at deleteHistory()...');
    Console.log(license, description, mileage);

    const result = await session.run(
      `
        MATCH (v:Vehicle {license: $license})-[r:REPLACED|SERVICED]->(part:Part)
        WHERE part.description = $description AND r.mileage = $mileage
        DETACH DELETE part
      `,
      { license, description, mileage }
    );
    return result.summary.query;
  } finally {
    await session.close();
  }

}

export async function getLicenses(email:string) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
        MATCH (u:User {email: $email})-[:OWNS]->(v:Vehicle)
        RETURN v.license
      `,
      { email }
    );
    return result.records.map((record) => record.get('v.license')) || [];
  } finally {
    await session.close();
  }

}

export const getDescriptions = async () => {
  const session = driver.session();
  const result = await session.run('MATCH (n:Part) RETURN n.description AS description');
  const descriptions = result.records.map((record) => record.get('description'));
  await session.close();
  return descriptions;
};

export const getMileage = async (license: string) => {
  const session = driver.session();
  const result = await session.run('MATCH (v:Vehicle {license: $license}) RETURN v.currentMileage', { license });
  const descriptions = result.records.map((record) => record.get('v.currentMileage'));
  await session.close();
  return descriptions;
};

export const getAllMake = async () => {
  const session = driver.session();
  const result = await session.run('MATCH (m:Motorbike) RETURN DISTINCT m.make order by m.make asc');
  const brands = result.records.map((record) => record.get('m.make'));
  await session.close();
  return brands;
};

export const getYearsByBrand = async (brand: string) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (m:Motorbike) WHERE toLower(m.make) = $brand RETURN DISTINCT m.year as year order by year desc', { brand });
    const years = result.records.map((record) => record.get('year').toNumber());
    return years; // Return a plain array of years
  } catch (error) {
    console.error("Error fetching years:", error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  } finally {
    await session.close();
  }
};





export async function getMakeByBrandAndYear(brand: string, year: number) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
        MATCH (m:Motorbike)
        WHERE toLower(m.make) = $brand AND m.year = toFloat($year)
        RETURN DISTINCT m.model AS model order by model ASC
      `,
      { brand, year }
    );

    // Extract the models from the result records
    const models = result.records.map((record) => record.get('model'));
    console.log('++Query :',result.summary.query);
    console.log ('++models from db : ',models);

    return models; // Return an array of distinct motorbike models
  } catch (error) {
    console.error("Error fetching motorbike models:", error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  } finally {
    await session.close();
  }
}


export async function getAllNodesFromUser(email: string) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
        MATCH (u:User {email: $email})-[r*1..2]-(relatedNode)
RETURN u, r, relatedNode

      `,
      { email }
    );
    //return result;
    //return result.records.map((record) => record.get('relatedNode'));

    return result.records;



  } finally {
    await session.close();
  }

}


//MATCH (u:User {email: 'fizice@gmail.com'})-[r*1..2]-(relatedNode)
// RETURN u, r, relatedNode