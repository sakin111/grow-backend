import { Router } from "express";
import { upload } from "../../middleware/upload";
import { sendResponse } from "../../shared/sendResponse";
import httpStatus from "http-status";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/",
  checkAuth(...Object.values(Role)),
  upload.single("file"),
  (req, res) => {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "File uploaded successfully",
      data: {
        url: (req.file as any).path,
      },
    });
  }
);

export const uploadRouter = router;
