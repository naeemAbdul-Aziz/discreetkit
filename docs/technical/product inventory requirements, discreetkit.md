# Product Inventory Requirements

To successfully seed the discreetkit database and list items on the global storefront, please provide the following details for each product in our current inventory.

| Field Name | Status | Description | Example / Format |
| :--- | :--- | :--- | :--- |
| **Name** | 🔴 Required | The public-facing name of the product. | "HIV Self-Test Kit", "Durex Extra Safe" |
| **Category** | 🔴 Required | The top-level grouping for the storefront. | "Test Kits", "Intimacy Essentials" |
| **Price (GHS)** | 🔴 Required | The default base retail price. | `45.00` |
| **Stock Level** | 🔴 Required | Total initial global stock quantity. | `150`, `500` |
| **Image** | 🟡 Recommended | Link to a high-quality product photo. | `https://res.cloudinary.com/...` |
| **Description** | 🟡 Recommended | Short paragraph explaining benefits. | "Water-based, non-sticky feel..." |
| **Featured** | 🟡 Recommended | Highlight product on the homepage? | `Yes` / `No` |
| **Requires Prescription**| 🟡 Recommended | Does it require a medical prescription? | `Yes` / `No` |
| **Student Eligible** | 🟡 Recommended | Can student accounts buy it at a discount? | `Yes` / `No` |
| **Student Price (GHS)**| 🔵 Optional | Specific discounted rate for verified students.| `35.00` |
| **Sub-Category** | 🔵 Optional | Deeper categorization. | "HIV", "Condoms", "Lubricants" |
| **Brand** | 🔵 Optional | Manufacturer of the product. | "ClearBlue", "Fiesta", "Durex" |
| **In The Box** | 🔵 Optional | List of all items included in the package. | "12 condoms, user guide" |
| **Usage Instructions** | 🔵 Optional | Step-by-step guidance for the customer. | "Open carefully, Dispose after" |
| **Savings (GHS)** | 🔵 Optional | Amount saved (used for value bundles). | `10.00` |

*Note: For the fastest bulk upload, prioritizing the Required and Recommended fields will ensure the products are fully functional in both the Admin and Pharmacy portals.*

## Proposed Catalogue

The following products make up our current KPIs based on our medical circle. For the admin handling the database seeding, please use this reference:

| Category | Product / Brand | Requires Prescription | Notes |
| :--- | :--- | :--- | :--- |
| **Condoms** | Durex | No | All variants recommended |
| **Condoms** | Kiss | No | All variants recommended |
| **Condoms** | Flames | No | All variants recommended |
| **Condoms** | Fiesta | No | All variants recommended |
| **Condoms** | Ebony | No | All variants recommended |
| **Condoms** | Unidus | No | All variants recommended |
| **Condoms** | Pasante | No | All variants recommended |
| **Condoms** | Rough Rider | No | All variants recommended |
| **Lubricants** | K-Y Gel Lubricant | No | |
| **Lubricants** | Lubrica Strawberry | No | |
| **Lubricants** | Durex play | No | |
| **Lubricants** | Levon – 2 | No | |
| **Lubricants** | Lubrimax Jelly | No | |
| **Lubricants** | D & E Lubricant gel | No | |
| **Lubricants** | Funtime Orgasm gel | No | |
| **Lubricants** | Fiesta lubricant gel | No | |
| **Male enhancement drugs** | Dragon spray/lozenges/tab | No | |
| **Male enhancement drugs** | Red Sun | No | |
| **Male enhancement drugs** | Procomil spray and tab | No | |
| **Male enhancement drugs** | Viagra tablet 100mg/50mg | No | |
| **Male enhancement drugs** | Imax Delay Spray | No | |
| **Male enhancement drugs** | Talgentis-5 | No | |
| **Male enhancement drugs** | Kamagra 100mg | No | |
| **Male enhancement drugs** | Comit-50 | No | |
| **Male enhancement drugs** | Cialis 20mg | No | |
| **Male enhancement drugs** | Kamagra 50mg oral jelly | No | |
| **Male enhancement drugs** | Sildenafil 100mg/50mg/25mg | No | |
| **Male enhancement drugs** | Mr. Q | No | |
| **Male enhancement drugs** | Adams Secret | No | |
| **Emergency Contraceptive** | Lydia Postpill | No | |
| **Emergency Contraceptive** | Lydia oral contraceptive pill | No | |
| **Emergency Contraceptive** | Postinor – 2 | No | |
| **Emergency Contraceptive** | Levon 2 | No | |
| **Emergency Contraceptive** | Yasmin 0.03/3mg tablet | No | |
| **Emergency Contraceptive** | BK -1 | No | |
| **Emergency Contraceptive** | Microgynon 30 tablet | Yes | |
| **Emergency Contraceptive** | Microgynon Fe tablet | Yes | |
