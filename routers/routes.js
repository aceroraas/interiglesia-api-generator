import express from 'express';
import { loginController } from '../controllers/loginController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { createEntity, getAllEntities } from '../controllers/entitiesController.js';
import { createApp, getApps } from '../controllers/applicationsController.js';
import { createInstallerToken, deleteInstallerToken, generateInstallerFile, getAllIntallerTokens, registerInstaller } from '../controllers/installerController.js';
const router = express.Router();

// ###SESSION LOGIN##
router.post('/login', loginController);

//###ENTITIES###
router.post('/entities', authenticateToken, createEntity);
router.get('/entities', authenticateToken, getAllEntities);

//###APLICATIONS###
router.post('/applications', authenticateToken, createApp);
router.get('/applications', authenticateToken, getApps);

//###INSTALLER###
router.get('/installer', authenticateToken, generateInstallerFile);
router.get('/installer/tokens', authenticateToken, getAllIntallerTokens);
router.get('/installer/tokens/generate', authenticateToken, createInstallerToken);
router.delete('/installer/tokens/delete', authenticateToken, deleteInstallerToken);
router.post('/installer/register', authenticateToken, registerInstaller);

export default router;
