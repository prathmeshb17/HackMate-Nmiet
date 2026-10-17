import { runDSATests } from './src/dsa/testRunner.js';

console.log('--- RUNNING HACKMATE DSA UNIT TESTS ---');
const results = runDSATests();
results.forEach(r => {
  console.log(`[${r.status}] ${r.name} - ${r.extraInfo}`);
});
console.log('---------------------------------------');
