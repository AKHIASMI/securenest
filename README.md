# 🛡️ SecureNest – Life Insurance Needs Finder
> Find out how much life cover your family actually needs, see which type of plan fits, and book an advisor, in four steps.
SecureNest is a front-end web app built for a BFSI hackathon problem: *"Intelligent Life Insurance Needs Finder & Digital Advisory Platform."* It replaces a static sales funnel with a guided, explainable journey. It runs entirely in the browser, with no server and no database, and no customer data leaves the device.
## Table of contents
1. [Features](#features)
2. [Quick start](#quick-start)
3. [Project structure](#project-structure)
4. [How it works](#how-it-works)
5. [Worked example](#worked-example)
6. [Configuration](#configuration)
7. [Input validation](#input-validation)
8. [Accessibility and design](#accessibility-and-design)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Limitations](#limitations)
12. [Roadmap](#roadmap)
---

## Features

| Step | What the user does | What the app does |
|---|---|---|
| **1. Profile** | Enters age, retirement age, income, dependents, children, education cost, other goals, loans, savings, existing cover, budget, smoker status and risk appetite | Validates every field and explains errors |
| **2. Your cover** | Reads the recommendation | Calculates the cover using the **Net Needs** method, cross-checks with **Human Life Value**, and draws a breakdown chart |
| | Ticks "what if" boxes | Re-calculates for *income drops 20%* and *another child* and shows the change |
| **3. Choose plan** | Picks a product, moves the **cover** and **term** sliders | Ranks Term, Whole Life, Endowment and ULIP, shows the premium live, a budget meter and an illustrative maturity value |
| **4. Advisor** | Chooses an advisor, mode, date and slot | Validates name and mobile number, then shows a simulated booking confirmation with a reference ID |

## Quick start

**Requirements:** a modern browser, and internet access at least once (the chart library loads from a CDN).git 
## Project structure

```
securenest/
├── index.html            # Page shell and script/style links
├── styles.css            # Layout, colours, light and dark themes, responsive rules
├── app.js                # All logic and the four screens
├── README.md
└── .vscode/
    └── extensions.json   # Suggests the Live Server extension
```

Inside `app.js`:

| Part | Purpose |
|---|---|
| `A` | Global assumptions (inflation, investment return) |
| `calc(s)` | The needs engine: Net Needs and Human Life Value |
| `eff()` | Applies the "what if" scenarios to the profile |
| `prem()` / `maturity()` | Simplified premium and maturity formulas |
| `match()` | Rule-based product ranking |
| `s1()` … `s4()` | The four screens |

## How it works

### 1. Needs engine
```
real rate r = (1 + return) / (1 + inflation) − 1        (default 8% and 6%)
years n     = retirement age − current age

Income replacement = PV of (income × share family depends on) over n years at rate r
                     (zero if there are no dependents)
Goals              = children × education cost + other goals   (today's money)
Needs              = Income replacement + Loans + Goals
Resources          = Savings + Existing cover
Net Needs (gap)    = max(0, Needs − Resources)
Recommended cover  = Net Needs rounded up to the next ₹5 lakh
```
**Human Life Value** is shown as a cross-check: the present value of future income after 30% personal spending, until retirement.

### 2. Product matching
Each product gets a score from rules. The highest score gets the **Best fit** badge.

| Product | Higher score when… | Lower score when… |
|---|---|---|
| **Term Life** | Premium is within budget; user has no savings goals | Premium is above budget |
| **Whole Life** | Within budget; risk appetite is low; age under 45 | Above budget |
| **Endowment** | Within budget; risk appetite is low; user has savings goals | Above budget (strong penalty) |
| **ULIP** | Within budget; risk appetite is high (moderate gets a smaller boost); user has goals | Above budget (strong penalty); low risk appetite |

"Within budget" means the annual premium is at most *budget % × annual income*.

### 3. Illustrative premium rates
Age factor `f = 1.07^(age − 30)`, multiplied by 1.6 for smokers. `c` is the cover in crores.

| Product | Premium per year |
|---|---|
| Term | `c × ₹9,000 × f × (1 + 0.01 × (term − 25))` |
| Whole Life | `c × ₹55,000 × f^0.6 × √(25 / term)` |
| Endowment | `c × ₹4,50,000 × (1 + 0.005 × (age − 30))` |
| ULIP | `cover ÷ 10` |

Maturity illustrations: Endowment at 4.5% growth; ULIP at 8% growth after 10% charges. Both are **assumptions, not guarantees**.

## Worked example

Default profile: age 32, retire at 60, income ₹12 L, 2 dependents, 1 child (₹15 L education), ₹5 L other goals, ₹25 L loans, ₹8 L savings, no existing cover, 70% income dependence, non-smoker.

| Item | Amount |
|---|---|
| Income replacement (28 years) | ≈ ₹1.81 Cr |
| Loans | ₹0.25 Cr |
| Goals | ₹0.20 Cr |
| Savings + existing cover | − ₹0.08 Cr |
| **Net Needs** | **≈ ₹2.18 Cr** |
| **Recommended cover** (rounded up) | **₹2.20 Cr** (about 18× income) |
| Human Life Value cross-check | ≈ ₹1.81 Cr |

Example annual premiums for ₹2.2 Cr cover over 28 years: Term ≈ ₹23 k, Whole Life ≈ ₹1.24 L, Endowment ≈ ₹10 L, ULIP ≈ ₹22 L. Savings-oriented plans look expensive at this cover, so the engine ranks Term first. Users can lower the cover with the slider to explore the others.

## Configuration

Everything is in `app.js`:
- **Inflation and return:** edit the `A` object, `const A={infl:6,ret:8}`.
- **Premium rates:** edit `prem()`.
- **Maturity growth rates:** edit `maturity()`.
- **Ranking rules:** edit the scores inside `match()`.
- **Personal spending share in HLV:** change `0.7` in `calc()` (it is 1 − 30%).
- **Colours and themes:** edit the CSS variables at the top of `styles.css`.

## Input validation

- Age must be 18–65.
- Retirement age must be above current age.
- Percentages (income share, budget) must be 100 or less.
- Income must be above zero, and no number may be negative or blank.
- Booking needs a name (2+ characters) and a 10-digit Indian mobile number starting with 6–9.

## Accessibility and design

- Responsive layout for phone, tablet and desktop.
- Light and dark themes follow the system setting.
- Keyboard-friendly controls and visible focus outlines.
- Errors use `role="alert"` so screen readers announce them.
- Colour is never the only signal (the budget meter also states "within budget" or "over budget" in text).

## Testing

There is no automated test suite yet. To check the logic:
1. Run the default profile and confirm the numbers in the worked example above.
2. Set income to 0, age to 70 or retirement age below age, and check the error messages.
3. Set dependents to 0 and confirm income replacement becomes ₹0.
4. Tick the scenarios and confirm the cover changes.
5. Optional syntax check: `node --check app.js`.

## Troubleshooting

| Problem | Fix |
|---|---|
| Chart is blank | You are offline; the chart library loads from a CDN. Connect and refresh |
| Live Server option missing | Install the **Live Server** extension, or use Option B |
| Page looks unstyled | Open the folder in VS Code and keep `styles.css` and `app.js` next to `index.html` |
| Booking confirmation vanishes on refresh | By design: bookings are simulated and held in memory |

## Limitations

- Premiums, returns and booking are simplified and simulated; there is no real insurer data.
- Goals are in today's money (no separate goal inflation); taxes, riders and medical underwriting are not modelled.
- The ranking is rule-based, not machine-learned.
- A masked copy of the last booking (name, advisor, date, last 4 digits of the number) is saved in the browser's local storage only; there is no backend.
- No automated tests yet.

## Roadmap

- Real insurer premium tables and eligibility rules
- Real chat or video consultation
- Hindi and regional-language support
- Joint spouse and family planning
- Automated tests for the needs engine

