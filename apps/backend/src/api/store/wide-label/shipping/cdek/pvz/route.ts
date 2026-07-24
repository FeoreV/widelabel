import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CdekPvzAdapter } from "../../../../../../integrations/cdek/pvz.ts";
import { defaultAuthClient } from "../rates/route.ts";

export const defaultPvzAdapter = new CdekPvzAdapter(
  defaultAuthClient,
  process.env.CDEK_API_URL || "https://api.edu.cdek.ru/v2"
);

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { city_code } = req.query as any;

  if (!city_code) {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "city_code parameter is required",
      retryable: false,
    });
    return;
  }

  const pvzAdapter: CdekPvzAdapter =
    (req as any).scope?.resolve("cdekPvzAdapter") || defaultPvzAdapter;

  try {
    const pvzList = await pvzAdapter.getPvzsByCity(parseInt(city_code as string, 10));
    res.status(200).json({ pvz_list: pvzList });
  } catch (err: any) {
    res.status(500).json({
      code: "CDEK_PVZ_FAILED",
      message: err.message || "Failed to fetch CDEK PVZ points",
      retryable: true,
    });
  }
};
