// Mock server-only before any other imports
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(name: string) {
  if (name === 'server-only') return {};
  return originalRequire.apply(this, arguments);
};

import 'dotenv/config';
import { getOperationalLedger } from '../src/lib/admin-actions';

async function run() {
  console.log("Calling getOperationalLedger(2)...");
  try {
    const entries = await getOperationalLedger(2);
    console.log("Success! Returned", entries.length, "entries.");
    if (entries.length > 0) {
      console.log("First entry:", entries[0]);
    }
  } catch (err) {
    console.error("Crash inside getOperationalLedger:", err);
  }
}

run();
