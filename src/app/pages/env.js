import { env } from 'next/config';


export function getEnvironmentVariable(varName) {
  return process.env[varName];
}