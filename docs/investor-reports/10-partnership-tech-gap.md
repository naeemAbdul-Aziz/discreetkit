## Bridging Operational Gaps (2026-02)

- Automated detection of stuck orders fills human process gaps in off-peak hours.
- SMS alerts to partner contacts reduce reliance on dashboards and email latency.
- Inventory auto-release avoids dead stock and improves product availability without manual intervention.
- Clear endpoints and test commands enable partners to validate integrations quickly.
# Technology Gap Analysis: Supports for Partnership Agreement

**Objective:** Align functionality with `09-pharmacy-partnership-agreement.md`.

---

## 1. Commercial Terms Gap (Trade Discount)

**Agreement:** "Partner supplies products at a Trade Discount (e.g., 20%)."
**Current State:** System tracks `stock_level` but uses Global Retail Price (`price_ghs`). No data field for "Pharmacy Cost Price" or "Discount Rate".

### Required Changes:

1. **Database Migration:**
   * Add `trade_discount_percentage` (int, default 20) to `pharmacies` table.
   * *Alternative:* Add `cost_price` (decimal) to `pharmacy_products` for item-level granularity (More complex but accurate).
   * *Recommendation:* Start with **Flat % Discount** on `pharmacies` table for simplicity.
2. **Admin Dashboard:**
   * Add input field for "Trade Discount %" when creating/editing a Pharmacy.

---

## 2. Settlement Gap (T+7 Payout)

**Agreement:** "Platform remits total due weekly on Tuesday."
**Current State:** No settlement calculation logic. Admin has to manual calculate order totals per pharmacy.

### Required Changes:

1. **Database Migration:**
   * Add `bank_name`, `account_number`, `momo_number` to `pharmacies` table.
2. **Admin Feature (Report):**
   * Create "Payouts" Tab in Admin Dashboard.
   * **Logic:**
     * Filter Orders by `pharmacy_id` + `status='completed'` + `date_range`.
     * Calculate `Total Retail Revenue`.
     * Calculate `Payout Amount` = `Total Retail * (1 - (trade_discount / 100))`.
     * Generate CSV Export for Finance Team.

---

## 3. SLA Gap (10-Minute Response)

**Agreement:** "Partner must accept orders within 10 minutes."
**Current State:** `pharmacy_ack_status` exists, but no alerts for breached SLA.

### Required Changes:

1. **Cron/Scheduled Job:**
   * Run every 5 minutes.
   * Find orders where `status='pending'` AND `created_at > 10 mins ago`.
   * Trigger "SLA Breach Alert" (SMS/Email) to Admin Team to re-assign order manually.

---

## 4. Implementation Roadmap

1. **Phase 1 (Immediate):**
   * Update Agreement Doc (Done).
   * Add `bank_details` fields to Pharmacy Profile (Code).
2. **Phase 2 (Next Sprint):**
   * Build "Payout Calculator" in Admin Dashboard (Code).
3. **Phase 3 (Scale):**
   * Automated SLA Monitoring & Re-assignment (Code).
