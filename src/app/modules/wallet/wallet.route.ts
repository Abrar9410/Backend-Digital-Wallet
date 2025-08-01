import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { WalletControllers } from "./wallet.controller";


const router = Router();


router.get("/all-wallets", checkAuth(Role.ADMIN), WalletControllers.getAllWallets);
router.get("/my-wallet", checkAuth(Role.USER, Role.AGENT), WalletControllers.getMyWallet);
router.get("/:ownerEmail", checkAuth(Role.ADMIN), WalletControllers.getSingleWallet);

router.patch("/top-up", checkAuth(...Object.values(Role)), WalletControllers.addMoney);
router.patch("/cash-in/:userEmail", checkAuth(Role.AGENT), WalletControllers.cashIn);
router.patch("/cash-out/:userEmail", checkAuth(Role.AGENT));
router.patch("/send-money/:userEmail", checkAuth(...Object.values(Role)));
router.patch("/update/:walletId", checkAuth(Role.ADMIN));

export const WalletRoutes = router;