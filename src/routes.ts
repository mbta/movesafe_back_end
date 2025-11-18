import express, { Router } from "express";
import {
    carController,
    inspectionController,
    inspectionFormController,
    lineController,
    moveController,
    moveReasonController,
    signatureController,
    tagController,
    userController,
    yardController
} from './controllers';
import upload from "./utils/multer";
import { authorize } from "./auth/authorizationMiddleware";
import { ManagerRoles, YardMasterRoles, YardMotorPersonRoles } from "./enum/userRoles.enum";

const routes: Router = express.Router();

routes.get("/lines", authorize(YardMasterRoles.concat(YardMotorPersonRoles, ManagerRoles)), lineController.getAll);

routes.get("/yards", authorize(YardMasterRoles.concat(YardMotorPersonRoles, ManagerRoles)), yardController.getAllByLineId);

routes.get("/cars", authorize(YardMasterRoles.concat(YardMotorPersonRoles, ManagerRoles)), carController.getAllByLineId);

routes.get("/inspection-forms", authorize(YardMotorPersonRoles), inspectionFormController.getAll);

routes.get("/move-reasons", authorize(YardMasterRoles.concat(YardMotorPersonRoles, ManagerRoles)), moveReasonController.getAll);

routes.get("/moves-by-date", authorize(ManagerRoles), moveController.getAllByDate);

routes.get("/moves-by-date-and-yard", authorize(YardMasterRoles), moveController.getAllByDateAndYard);

routes.get("/unassigned-moves", authorize(YardMotorPersonRoles), moveController.getAllUnassigned);

routes.get("/pending-moves", authorize(YardMotorPersonRoles), moveController.getAllPendingMove);

routes.get("/move-history", authorize(YardMotorPersonRoles), moveController.getMoveHistory);

routes.get("/move-details", authorize(YardMasterRoles.concat(ManagerRoles)), moveController.getMoveDetails);

routes.get("/inspection-stats-for-day", authorize(ManagerRoles), inspectionController.getStatsForDay);

routes.get("/yard-motor-persons-by-line", authorize(YardMasterRoles.concat(YardMotorPersonRoles, ManagerRoles)), userController.getAllYardMotorPersonsByLine);

routes.get("/yard-motor-persons", authorize(ManagerRoles.concat(YardMotorPersonRoles)), userController.getAllYardMotorPersons);

routes.get("/yardmasters", authorize(ManagerRoles), userController.getAllYardMasters);

routes.get("/users", userController.getAllUsers);

routes.get("/tags", authorize(YardMasterRoles.concat(ManagerRoles)), tagController.getAll);

routes.post("/move", authorize(YardMasterRoles.concat(YardMotorPersonRoles)), moveController.create);

routes.post("/assign-move", authorize(YardMotorPersonRoles), moveController.assign);

routes.post("/release-move", authorize(YardMotorPersonRoles), moveController.release);

routes.post("/move-result", authorize(YardMotorPersonRoles), moveController.saveResult);

routes.post("/executed-move", authorize(YardMotorPersonRoles), moveController.updateExecuted);

routes.post("/cancel-move", authorize(YardMasterRoles), moveController.cancel);

routes.post("/signature", authorize(YardMasterRoles.concat(YardMotorPersonRoles)), upload.single('file'), signatureController.saveSignature);

routes.post("/user", userController.create);

routes.put("/user", userController.updateUser);

routes.delete("/user", userController.deleteUser);

export default routes;
