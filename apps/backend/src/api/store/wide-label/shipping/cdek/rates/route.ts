import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CdekRateAdapter } from "../../../../../../integrations/cdek/rates.ts";
import { CdekAuthClient } from "../../../../../../integrations/cdek/auth.ts";

export const defaultAuthClient = new CdekAuthClient(
  process.env.CDEK_CLIENT_ID || "test",
  process.env.CDEK_CLIENT_SECRET || "test",
  process.env.CDEK_API_URL || "https://api.edu.cdek.ru/v2"
);

export const defaultRateAdapter = new CdekRateAdapter(
  defaultAuthClient,
  process.env.CDEK_API_URL || "https://api.edu.cdek.ru/v2"
);

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { to_city_code, weight_grams } = req.query as any;

  if (!to_city_code) {
    res.status(400).json({
      code: "INVALID_INPUT",
      message: "to_city_code parameter is required",
      retryable: false,
    });
    return;
  }

  const rateAdapter: CdekRateAdapter =
    (req as any).scope?.resolve("cdekRateAdapter") || defaultRateAdapter;

  try {
    const fromCityCode = parseInt(process.env.CDEK_FROM_CITY_CODE || "44", 10);
    const weight = weight_grams ? parseInt(weight_grams as string, 10) : parseInt(process.env.CDEK_PACKAGE_WEIGHT_GRAMS || "1000", 10);

    const rate = await rateAdapter.calculateRate({
      tariff_code: parseInt((req.query.tariff_code as string) || "136", 10),
      from_location: { code: fromCityCode },
      to_location: { code: parseInt(to_city_code as string, 10) },
      packages: [
        {
          weight,
          length: parseInt(process.env.CDEK_PACKAGE_LENGTH_CM || "30", 10),
          width: parseInt(process.env.CDEK_PACKAGE_WIDTH_CM || "25", 10),
          height: parseInt(process.env.CDEK_PACKAGE_HEIGHT_CM || "10", 10),
        },
      ],
    });

    res.status(200).json({ rate });
  } catch (err: any) {
    res.status(500).json({
      code: "CDEK_RATE_FAILED",
      message: err.message || "Failed to calculate CDEK shipping rate",
      retryable: true,
    });
  }
};
