import { Router } from 'express';
import { ZoneController } from '../controllers/zone.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router: Router = Router();
const zoneController: ZoneController = new ZoneController();

// Zone CRUD routes
router.post('/create-zone', authenticate, zoneController.createZone);
router.get('/get-zones', authenticate, zoneController.getAllZones);
router.get('/get-zone/:id', authenticate, zoneController.getZoneById);
router.put('/update-zone/:id', authenticate, zoneController.updateZone);
router.delete('/delete-zone/:id', authenticate, zoneController.deleteZone);

export default router;
