import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { validateHospitalCode } from '../src/lib/refill-logic';

async function testValidationFixed() {
    console.log('--- TESTING VALIDATION (FIXED ENV) ---');
    const code = 'DK-UGMC-0001';
    console.log(`Testing Code: ${code}`);
    
    try {
        const result = await validateHospitalCode(code);
        console.log('Result:', result);
    } catch (e: any) {
        console.error('Validation crashed:', e.message);
    }
}

testValidationFixed();
