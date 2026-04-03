import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import documentsRouter from "./documents";
import dashboardRouter from "./dashboard";
import aiRouter from "./ai";
import formsRouter from "./forms";

const router: IRouter = Router();

router.use(healthRouter);
router.use(casesRouter);
router.use(documentsRouter);
router.use(dashboardRouter);
router.use(aiRouter);
router.use(formsRouter);

export default router;
