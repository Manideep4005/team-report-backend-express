import { Router } from "express";

import * as UserController from "../controllers/user.controller";

import { authenticate } from "../middleware/auth.middleware";

import { requirePermission } from "../middleware/permission.middleware";

import { validate } from "../middleware/validate.middleware";

import {
    createUserSchema,
    updateUserSchema,
} from "../validations/user.validation";


const router = Router();


router.use(authenticate);


/* ================================================================
   ACTIVE USERS
================================================================ */

router.get(
    "/",
    requirePermission("USER_VIEW"),
    UserController.getAll
);


/* ================================================================
   INACTIVE / DELETED USERS
   MUST COME BEFORE /:id
================================================================ */

router.get(
    "/inactive",
    requirePermission("USER_VIEW"),
    UserController.getInactive
);


/* ================================================================
   USER BY ID
================================================================ */

router.get(
    "/:id",
    requirePermission("USER_VIEW"),
    UserController.getById
);


/* ================================================================
   CREATE
================================================================ */

router.post(
    "/",
    requirePermission("USER_CREATE"),
    validate(createUserSchema),
    UserController.create
);


/* ================================================================
   UPDATE
================================================================ */

router.put(
    "/:id",
    requirePermission("USER_UPDATE"),
    validate(updateUserSchema),
    UserController.update
);


/* ================================================================
   DELETE
================================================================ */

router.delete(
    "/:id",
    requirePermission("USER_DELETE"),
    UserController.remove
);


/* ================================================================
   RESTORE
================================================================ */

router.post(
    "/:id/restore",
    requirePermission("USER_RESTORE"),
    UserController.restore
);


/* ================================================================
   RESET PASSWORD
================================================================ */

router.post(
    "/:id/reset-password",
    requirePermission("USER_PASSWORD_RESET"),
    UserController.resetPassword
);


export default router;