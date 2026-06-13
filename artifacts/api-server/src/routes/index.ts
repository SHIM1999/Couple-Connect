import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import todosRouter from "./todos";
import goalsRouter from "./goals";
import wishlistRouter from "./wishlist";
import bucketlistRouter from "./bucketlist";
import eventsRouter from "./events";
import summaryRouter from "./summary";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(todosRouter);
router.use(goalsRouter);
router.use(wishlistRouter);
router.use(bucketlistRouter);
router.use(eventsRouter);
router.use(summaryRouter);

export default router;
