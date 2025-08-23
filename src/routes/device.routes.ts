import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';
import { authenticate } from '../middlewares/auth.middleware';
// import { AuthMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();
const deviceController: DeviceController = new DeviceController();

// Device CRUD routes
router.post('/create-device', authenticate, deviceController.createDevice);
router.get('/get-devices', authenticate, deviceController.getAllDevices);
router.get('/get-device/:id', authenticate, deviceController.getDeviceById);
router.put('/update-device/:id', authenticate, deviceController.updateDevice);
router.delete('/delete-device/:id', authenticate, deviceController.deleteDevice);

export default router;