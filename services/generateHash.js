import { randomBytes } from 'crypto';
export const generateHash = (bytes) => {
   const hashId = randomBytes(bytes).toString('hex');
   return hashId;
};