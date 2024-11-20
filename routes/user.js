import express from 'express';
const router = express.Router();

import {getUserDetails, login, logout, register, updateUser} from "../controllers/usercontroller.js";


router.post('/login', login);

router.post('/register', register);

router.get('/userdetails', getUserDetails)

router.post('/userupdate/:_id', updateUser)

router.get('/logout', logout)

export default router;
