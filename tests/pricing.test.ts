import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  pricingFromCost,
  saleFromCostMinor,
  supplierReaisToMinor,
  unitPriceForPayment,
} from "../src/lib/pricing/supplier";

describe("supplier pricing", () => {
  it("computes Pix and card from R$ 160 cost", () => {
    const cost = supplierReaisToMinor(160);
    assert.equal(cost, 16000);
    const pix = saleFromCostMinor(cost, 47);
    const card = saleFromCostMinor(cost, 53);
    assert.equal(pix, 23520);
    assert.equal(card, 24480);
  });

  it("pricingFromCost returns gross profit", () => {
    const r = pricingFromCost({ costMinor: 16000 });
    assert.equal(r.pricePixMinor, 23520);
    assert.equal(r.priceCardMinor, 24480);
    assert.equal(r.grossProfitPixMinor, 7520);
    assert.equal(r.grossProfitCardMinor, 8480);
  });

  it("checkout uses Pix vs card by payment method", () => {
    const v = { price: 23520, cardPrice: 24480 };
    assert.equal(unitPriceForPayment(v, "bkash"), 23520);
    assert.equal(unitPriceForPayment(v, "cod"), 24480);
    assert.equal(unitPriceForPayment(v, "nagad"), 24480);
  });
});
