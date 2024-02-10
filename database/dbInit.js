import { createUrlTable, createUserTable } from "../model/index.js";
import { checkConnection } from "./connection.js";

async function dbInit() {
  await checkConnection();
  await createUserTable();
  await createUrlTable();
}

export default dbInit;
