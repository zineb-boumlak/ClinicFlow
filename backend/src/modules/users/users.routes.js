const express = require('express');
const authenticate = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const roleGuard = require('../../middlewares/role');
const controller = require('./users.controller');
const { createUserSchema, updateUserSchema, userIdSchema } = require('./users.schema');

const router = express.Router();

router.use(authenticate, roleGuard(['admin']));

router.get('/', controller.getUsers);
router.post('/', validate(createUserSchema), controller.createUser);
router.put('/:id', validate(updateUserSchema), controller.updateUser);
router.delete('/:id', validate(userIdSchema), controller.deleteUser);

module.exports = router;