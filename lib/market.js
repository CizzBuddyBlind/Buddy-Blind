export const MARKETS = {
  HK: {
    id: "HK",
    fee: "HK$5",
    free: "HK$0",
    lite: "HK$10",
    premium: "HK$50",
    prices: {
      fee: "price_1UISZsPmyR3fIMKFcpj7cNdy",
      lite: "price_1UISXEPmyR3fIMKF3EMKbkND",
      premium: "price_1UISXdPmyR3fIMKFkyKCHbsB",
    },
  },
  NZ: {
    id: "NZ",
    fee: "NZ$1",
    free: "NZ$0",
    lite: "NZ$5",
    premium: "NZ$12",
    prices: {
      fee: "price_1UMOK0PmyR3fIMKFnhu4xVBq",
      lite: "price_1UMOLLPmyR3fIMKFe4LdbliE",
      premium: "price_1UMOKnPmyR3fIMKFojKfWL5L",
    },
  },
  AU: {
    id: "AU",
    fee: "A$1",
    free: "A$0",
    lite: "A$5",
    premium: "A$12",
    prices: {
      fee: "price_1UMOJWPmyR3fIMKFlhm755eT",
      lite: "price_1UMOLcPmyR3fIMKFsJUF72Yl",
      premium: "price_1UMOL2PmyR3fIMKFsNSTLfBd",
    },
  },
};

export function marketFromCode(code) {
  const id = String(code || "").toUpperCase();
  if (id === "NZ" || id === "AU") return MARKETS[id];
  return MARKETS.HK;
}

export function priceFor(code, kind) {
  const market = marketFromCode(code);
  return market.prices[kind] || market.prices.fee;
}
