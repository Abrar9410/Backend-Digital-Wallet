import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { WalletControllers } from "./wallet.controller";
import { validateMutationRequest } from "../../middlewares/validateMutationRequest";
import { updateWalletZodSchema } from "./wallet.validation";


const router = Router();


router.get("/all-wallets", checkAuth(Role.ADMIN), WalletControllers.getAllWallets);
router.get("/my-wallet", checkAuth(Role.USER, Role.AGENT), WalletControllers.getMyWallet);
router.get("/:walletId", checkAuth(Role.ADMIN), WalletControllers.getSingleWallet);

router.patch("/top-up", checkAuth(...Object.values(Role)), WalletControllers.addMoney);
router.patch("/cash-in/:userEmail", checkAuth(Role.AGENT), WalletControllers.cashIn);
router.patch("/cash-out/:userEmail", checkAuth(Role.AGENT), WalletControllers.cashOut);
router.patch("/send-money/:receiverEmail", checkAuth(...Object.values(Role)), WalletControllers.sendMoney);
router.patch("/update-wallet/:id", checkAuth(Role.ADMIN), validateMutationRequest(updateWalletZodSchema), WalletControllers.updateWallet);

export const WalletRoutes = router;