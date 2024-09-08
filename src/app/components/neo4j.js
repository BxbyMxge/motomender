// neo4j.js
import { Driver, auth } from 'neo4j-driver';

const neo4jUri = process.env.NEO4J_URL; // Neo4j server URI
const neo4jUser = process.env.NEO4J_USERNAME; // Neo4j username
const neo4jPassword = process.env.NEO4J_PASSWORD; // Neo4j password

const neo4jDriver = async () => {
  try {
    const driver = new Driver(neo4jUri, auth.basic(neo4jUser, neo4jPassword));
    await driver.verifyConnectivity();
    console.log('Driver created successfully');
    console.info('success');
    // Add your code to update the data in Neo4j here
  } catch (error) {
    console.error('Error updating Neo4j:', error);
    console.info('Error updating Neo4j:', error);
    throw error;
  }
};

export default neo4jDriver;