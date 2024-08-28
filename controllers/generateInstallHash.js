import { randomBytes } from 'crypto';
export const generateInstallHash = () => {
   const hashId = randomBytes(16).toString('hex');
   return hashId;
};