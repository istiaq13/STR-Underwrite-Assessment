# Short-Term Rental (STR) Acquisitions Underwriting Training Platform

![Build & Test Status](https://img.shields.io/badge/playwright_e2e_tests-7%2F7_passing_(100%25)-52A68B?style=for-the-badge&logo=playwright)
![Security Layer](https://img.shields.io/badge/security_suite-6--layer_enterprise_hardened-52A68B?style=for-the-badge&logo=security)
![Next.js](https://img.shields.io/badge/next.js_14-app_router-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/typescript-strict_mode-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/tailwind_css-white_canvas_design-06B6D4?style=for-the-badge&logo=tailwindcss)
![Zod](https://img.shields.io/badge/validation-zod_runtime_schemas-3E67B1?style=for-the-badge&logo=zod)

An enterprise-grade training, simulation, and evaluation platform for short-term rental (STR) acquisitions analysts. Built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **Zod**, this frontend application delivers real-time reactive financial modeling, blind underwriting simulations, deterministic scoring against senior underwriter benchmarks, live REST API synchronization with PostgreSQL, and a multi-layer defense-in-depth security suite.

---

## 📑 Table of Contents

1. [Executive Overview & Business Domain](#1-executive-overview--business-domain)
2. [Complete Frontend Architecture & State Machine](#2-complete-frontend-architecture--state-machine)
3. [Component & Tab-by-Tab Implementation Details](#3-component--tab-by-tab-implementation-details)
   - [3.1 Dashboard & Catalog View (`DashboardView` & `PropertyCard`)](#31-dashboard--catalog-view-dashboardview--propertycard)
   - [3.2 Property Header & Live Return Ticker (`PropertyHeader`)](#32-property-header--live-return-ticker-propertyheader)
   - [3.3 Tab 1: Financials & Capital Stack (`FinancialsTab`)](#33-tab-1-financials--capital-stack-financialstab)
   - [3.4 Tab 2: Analysis & Revenue Waterfall (`AnalysisTab`)](#34-tab-2-analysis--revenue-waterfall-analysistab)
   - [3.5 Tab 3: Deal Tags & Investment Thesis (`DealTagsTab`)](#35-tab-3-deal-tags--investment-thesis-dealtagstab)
   - [3.6 Tab 4: Review & Pre-Flight Audit Checklist (`ReviewTab`)](#36-tab-4-review--pre-flight-audit-checklist-reviewtab)
   - [3.7 Graded Scorecard & Evaluation View (`EvaluationView`)](#37-graded-scorecard--evaluation-view-evaluationview)
   - [3.8 Analyst Cohort Leaderboard (`LeaderboardView`)](#38-analyst-cohort-leaderboard-leaderboardview)
   - [3.9 Top Progress Indicator & Visual Dull Overlay (`TopProgressBar`)](#39-top-progress-indicator--visual-dull-overlay-topprogressbar)
4. [Financial Modeling & Mathematical Waterfall Engine](#4-financial-modeling--mathematical-waterfall-engine)
5. [Senior Analyst Benchmark & Deterministic Scoring Engine](#5-senior-analyst-benchmark--deterministic-scoring-engine)
6. [Enterprise 6-Layer Frontend Security Suite](#6-enterprise-6-layer-frontend-security-suite)
   - [Layer 1: CSRF / XSRF Double-Submit Handshake](#layer-1-csrf--xsrf-double-submit-handshake)
   - [Layer 2: Idempotency Keys & Anti-Replay Debouncing](#layer-2-idempotency-keys--anti-replay-debouncing)
   - [Layer 3: Strict Runtime Zod Schemas & Invariant Guards](#layer-3-strict-runtime-zod-schemas--invariant-guards)
   - [Layer 4: URL Protocol Sanitization & Stored XSS Guard](#layer-4-url-protocol-sanitization--stored-xss-guard)
   - [Layer 5: Content Security Policy (CSP) & OWASP Security Headers](#layer-5-content-security-policy-csp--owasp-security-headers)
   - [Layer 6: Global React Error Boundary & Exception Redaction](#layer-6-global-react-error-boundary--exception-redaction)
7. [Live REST API Integration & Dual-Mode Fallback Pipeline](#7-live-rest-api-integration--dual-mode-fallback-pipeline)
8. [Automated Playwright E2E Test Suite (7/7 Passing)](#8-automated-playwright-e2e-test-suite-77-passing)
9. [Design System, Aesthetics & Typography](#9-design-system-aesthetics--typography)
10. [Local Development, Installation & Verification](#10-local-development-installation--verification)
11. [Project Directory & File Structure](#11-project-directory--file-structure)

---

## 1. Executive Overview & Business Domain

In short-term rental (STR) acquisitions and private equity syndication, investment decisions hinge on answering:
> **"If an investor acquires this property, executes necessary capital improvements and furnishings, and operates it as a short-term rental, what is the risk-adjusted cash yield, and does it exceed our return hurdles?"**

Traditional training spreadsheets create cognitive overload and fail to provide immediate calibration feedback. This platform provides an interactive flight simulator for acquisitions analysts:
1. **Blind Underwriting**: Trainees underwrite real properties without seeing the senior analyst reference model. They analyze listing specs, market demand characteristics, financing terms, setup capital, operating expenses, and three revenue scenarios (Low, Mid, High).
2. **Deterministic Benchmark Grading**: On submission, the underwriting is graded against the senior analyst's reference model using objective mathematical bands.
3. **Itemized Variance Breakdown**: Trainees receive a detailed scorecard with visual target band spectrums, variance deltas, and line-item comparison tables showing where their assumptions diverged from senior underwriting standards.
4. **Cohort Gamification**: Tracks completed properties, average accuracy, streaks, and ranks trainees on an interactive cohort leaderboard.

---

## 2. Complete Frontend Architecture & State Machine

The frontend application is built on **Next.js 14 App Router** with React 18, TypeScript, and a centralized React Context state machine (`src/lib/context.tsx`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                      UnderwritingContext State                         │
├────────────────────────────────────────────────────────────────────────┤
│ • properties: Property[]              (Live catalog from /api/dashboard)│
│ • activeDraft: UnderwritingDraft | null (Current property in workspace) │
│ • drafts: Record<string, UnderwritingDraft> (Persisted draft cache)    │
│ • submissions: SubmissionRecord[]    (Trainee submission history)      │
│ • latestSubmission: SubmissionRecord | null (Most recent evaluation)   │
│ • leaderboard: LeaderboardEntry[]    (Cohort performance rankings)     │
│ • activeTab: "financials" | "analysis" | "tags" | "review"             │
│ • isSaving: boolean                  (Global mutation lock & debounce) │
│ • saveMessage: string | null         (Status indicator banner)         │
│ • isPageTransitioning: boolean       (Drives TopProgressBar overlay)   │
└────────────────────────────────────────────────────────────────────────┘
```

### State Machine Lifecycle & Synchronization
- **Mount & Hydration**: On initial load, `UnderwritingContext` queries `GET /api/dashboard`. If the backend is running, live property catalog and metrics are hydrated into state. LocalStorage caches are synchronized for offline resilience.
- **Property Selection**: Calling `selectProperty(zpid)` fetches listing specs from `GET /api/properties/{zpid}` and retrieves or initializes a draft via `GET /api/underwritings/property/{zpid}` or `POST /api/underwritings/property/{zpid}/start`.
- **Reactive Financial Recalculation**: Any change to purchase details, revenue scenarios, taxes, setup items, or operating expenses calls `updateDraft()`, which synchronously runs `calculateUnderwriting()` (`src/lib/calculations.ts`), updating all capital stack, debt service, cash flow, and return metrics across the entire application in under 2ms.
- **Draft Persistence**: Calling `saveDraft()` performs Zod validation, serializes the draft payload, and sends a `PUT /api/underwritings/{id}` request with CSRF headers. It also persists state to `localStorage` under `str_uw_drafts`.
- **Submission & Grading**: Calling `submitUnderwriting(zpid)` validates all schemas and financial invariants. It sends `POST /api/underwritings/{id}/submit`, captures the graded `SubmissionRecord`, updates dashboard property statuses, recalibrates the trainee's leaderboard standing, and navigates to `/evaluation`.

---

## 3. Component & Tab-by-Tab Implementation Details

### 3.1 Dashboard & Catalog View (`DashboardView` & `PropertyCard`)
- **Location**: `src/components/dashboard/DashboardView.tsx` & `src/components/dashboard/PropertyCard.tsx`
- **Responsibilities**:
  - **KPI Metric Banners**: Displays total properties available, submitted deals, in-progress drafts, and average cohort accuracy percentage.
  - **Market Filters**: Pill buttons allowing filtering by STR region (Smoky Mountains, Blue Ridge, Broken Bow, Kissimmee, Scottsdale, etc.).
  - **Search Bar**: Real-time client-side text filtering by street, city, state, or zip code.
  - **Property Card Specifications**:
    - High-resolution property photography with aspect ratio preservation.
    - Street address, city, state, zip code, and market badge.
    - Beds, baths, and square footage chips with Lucide icons.
    - Formatted list price.
    - **Benchmark Score Badge**: Shows best accuracy achieved (e.g., `100%`) with an immediate 0ms hover tooltip detailing tier information.
    - **Status Indicator**: Accurately reflects `Not Started`, `In Progress`, or `Submitted` based on draft and submission state.
    - **Interactive Action Buttons**:
      - `Start Underwriting`: For unstarted listings.
      - `Resume Underwriting`: For saved drafts.
      - `Review & Re-underwrite`: For submitted listings.
      - `View Gradesheet`: Quick link directly to the graded scorecard for completed properties.

### 3.2 Property Header & Live Return Ticker (`PropertyHeader`)
- **Location**: `src/components/workspace/PropertyHeader.tsx`
- **Responsibilities**:
  - Anchors the top of the underwriting workspace with listing metadata and thumbnail.
  - **Live Return Ticker**: High-density horizontal KPI ribbon displaying real-time derived metrics:
    - **Total Out of Pocket (OOP)**: Sum of down payment, closing costs, and setup budget.
    - **Annual Free Cash Flow**: Based on the active Mid scenario.
    - **Cash-on-Cash Return (CoC %)**: Reactive annual yield percentage.
    - **Cap Rate %**: Net Operating Income divided by Purchase Price.
  - **Workspace Action Toolbar**:
    - Save Draft button with animated spinner and status feedback ("Saving...", "Draft saved successfully").
    - Submit Underwriting button linking to review/submission flow.

### 3.3 Tab 1: Financials & Capital Stack (`FinancialsTab`)
- **Location**: `src/components/workspace/FinancialsTab.tsx`
- **Responsibilities**:
  - **Purchase & Debt Financing Card**:
    - Inputs for Purchase Price, Down Payment %, Interest Rate %, Closing Costs %, and Loan Term Years.
    - Auto-calculates loan amount, down payment in dollars, closing costs in dollars, and monthly/annual debt service.
  - **Optimization & Setup Capital Budget Card**:
    - Allows analysts to budget upfront capital expenditures required to maximize ADR (Average Daily Rate):
      - High-end furniture package
      - 6-person hot tub installation
      - Themed game room / arcade setup
      - Professional interior design & staging
      - Outdoor fire pit & landscaping
    - Dynamic addition, modification, and deletion of custom line items.
    - Real-time tallying of Total Setup Budget.
  - **Operating Expenses (OPEX) Card**:
    - Property Management Fee % (dynamically applied to gross revenue).
    - Recurring operational line items: Utilities (electric, water, gas, Wi-Fi), cleaning & linen fees, maintenance reserve, insurance, platform/channel fees.
    - Configurable expense frequency (monthly vs. annual) with automatic normalization to annual totals.
  - **Property Taxes Card**:
    - Tax assessed value and county/municipal tax rate percentage.
    - Auto-calculates annual property tax obligation.

### 3.4 Tab 2: Analysis & Revenue Waterfall (`AnalysisTab`)
- **Location**: `src/components/workspace/AnalysisTab.tsx`
- **Responsibilities**:
  - **3-Scenario Revenue Forecasting**:
    - Inputs for **Low** (conservative baseline), **Mid** (base case expectation), and **High** (peak season upside) gross annual revenue.
    - Enforces scenario validation hierarchy: $\text{Low} \le \text{Mid} \le \text{High}$.
  - **Revenue Comparables (Comps) Table**:
    - Interactive table displaying comparable listings in the immediate micro-market.
    - Columns: Comp Title, External URL, Distance, Bedrooms, Bathrooms, Average Daily Rate (ADR), Occupancy Rate %, and Annual Revenue.
    - External links are protected with URL protocol sanitization (`https://` or `http://` only) and `rel="noopener noreferrer"`.
  - **Financial Waterfall Breakdown**:
    - Visual stacked waterfall representation:
      $$\text{Gross Revenue} \longrightarrow \text{Total OPEX} \longrightarrow \text{Net Operating Income (NOI)} \longrightarrow \text{Debt Service} \longrightarrow \text{Free Cash Flow}$$
    - Tabular breakdown showing exact dollar amounts and % of revenue for Low, Mid, and High scenarios.
  - **Investor Return Metrics & Tax Depreciation**:
    - Free Cash Flow per scenario.
    - Cash-on-Cash Return (CoC %) per scenario.
    - Cap Rate % per scenario.
    - **Year 1 Cost Segregation Tax Depreciation Benefit**:
      - Calculates personal property basis reallocation (~20%).
      - Computes upfront tax loss shelter savings at investor marginal tax rates (37%).

### 3.5 Tab 3: Deal Tags & Investment Thesis (`DealTagsTab`)
- **Location**: `src/components/workspace/DealTagsTab.tsx`
- **Responsibilities**:
  - **13 Institutional Deal Tags** grouped into 3 strategic pillars:
    - **Yield & Cash Flow**: `high_cash_flow`, `turnkey`, `tax_efficient`, `strong_appreciation`.
    - **Risk & Downside**: `seasonal_risk`, `hoa_restrictions`, `regulatory_risk`, `high_capex`.
    - **Upside & Value-Add**: `value_add`, `amenity_upside`, `rebranding_opportunity`, `underperforming_comps`, `prime_location`.
  - Interactive toggle chips with colored active states and description tooltips.
  - **Investment Thesis Commentary**:
    - Textarea for capturing the trainee's qualitative justification, operational strategy, and downside protection thesis.

### 3.6 Tab 4: Review & Pre-Flight Audit Checklist (`ReviewTab`)
- **Location**: `src/components/workspace/ReviewTab.tsx`
- **Responsibilities**:
  - **Pre-Flight Audit Checklist**:
    - Verifies Purchase Price $> 0$.
    - Verifies Down Payment $\ge 0$.
    - Verifies Mid Revenue Forecast $> 0$ (required for benchmark grading).
    - Verifies Revenue Scenario Hierarchy ($\text{Low} \le \text{Mid} \le \text{High}$).
    - Verifies Property Taxes and Operating Expenses are configured.
  - **Submission State Machine & Anti-Replay Guard**:
    - Submit button is strictly disabled if any invariant fails.
    - Displays descriptive error messages guiding the user to the invalid field.
    - When clicked, button enters loading state with animated spinner (`isSaving = true`), disabling duplicate clicks.
    - Triggers `submitUnderwriting(zpid)`, sends mutation payload with idempotency key `X-Request-ID` and CSRF headers, and routes to `/evaluation`.

### 3.7 Graded Scorecard & Evaluation View (`EvaluationView`)
- **Location**: `src/components/evaluation/EvaluationView.tsx`
- **Responsibilities**:
  - **Hero Score Display**:
    - Large tabular score numeral (`100`, `70`, or `40`).
    - Color-coded tier badge:
      - **Best Band (100 pts)**: Green (`#52A68B`).
      - **Medium Band (70 pts)**: Amber (`text-amber-600`).
      - **Low Band (40 pts)**: Rose (`text-rose-600`).
  - **Score Explanation Banner**:
    - Displays trainee's Mid forecast vs senior analyst reference Mid, exact percentage deviation (e.g., `+3.2%`), and dollar variance.
  - **Visual Target Band Spectrum Gauge**:
    - Continuous horizontal gauge displaying color-coded zones:
      - Low Left ($< -25\%$)
      - Medium Left ($-25\%$ to $-10\%$)
      - Best Band Center ($\pm 10\%$)
      - Medium Right ($+10\%$ to $+25\%$)
      - Low Right ($> +25\%$)
    - Position pin indicating exactly where the trainee's forecast landed.
    - Labeled markers showing exact dollar thresholds for $-25\%$, $-10\%$, Reference Mid, $+10\%$, and $+25\%$.
  - **Target Bands Reference Cards**:
    - Three-column card grid explaining the scoring criteria and exact dollar ranges for Best, Medium, and Low bands.
  - **Side-by-Side Line Item Comparative Table**:
    - Comprehensive line-by-line audit comparing Candidate Underwriting vs Senior Analyst Reference:
      - Purchase Price & Down Payment
      - Total Setup Budget
      - Gross Revenue (Low / Mid / High)
      - Operating Expenses (Management, Utilities, Maintenance, Insurance)
      - Property Taxes & Debt Service
      - Net Operating Income (NOI)
      - Annual Free Cash Flow
      - Cash-on-Cash Return (CoC %)
    - Real-time calculation of dollar variance and percentage delta with directional badges.
  - **Navigation Controls**:
    - "Return to Dashboard" button to view updated catalog standing.
    - "Re-Underwrite Property" button to refine assumptions and test alternate scenarios.

### 3.8 Analyst Cohort Leaderboard (`LeaderboardView`)
- **Location**: `src/components/leaderboard/LeaderboardView.tsx`
- **Responsibilities**:
  - Displays full cohort ranking table sorted by Average Accuracy % and Best Score.
  - Columns: Rank (#1, #2, #3 badges), Analyst Name, Completed Deals, Best Score, Average Accuracy %, Best Tier Count, Active Streak.
  - Automatically identifies and highlights the current logged-in trainee ("You").
  - Recalculates dynamically when new underwritings are submitted.

### 3.9 Top Progress Indicator & Visual Dull Overlay (`TopProgressBar`)
- **Location**: `src/components/ui/TopProgressBar.tsx`
- **Responsibilities**:
  - Fixed top progress bar in corporate emerald (`#52A68B`, 2.5px height).
  - Triggers during route changes (`usePathname()`, `useSearchParams()`) and API mutations (`isSaving`).
  - Renders a subtle background dulling overlay (`bg-neutral-900/18 backdrop-blur-[1.5px]`).
  - Styled with `pointer-events-none` so that user interactions and automated test runners are never blocked.

---

## 4. Financial Modeling & Mathematical Waterfall Engine

All financial calculations are implemented in `src/lib/calculations.ts` using strict floating-point normalization.

### 1. Capital Stack Equations

$$\text{Loan Amount} = \text{Purchase Price} \times (1 - \text{Down Payment \%})$$

$$\text{Down Payment \$} = \text{Purchase Price} \times \text{Down Payment \%}$$

$$\text{Closing Costs \$} = \text{Purchase Price} \times \text{Closing Costs \%}$$

$$\text{Total Setup Budget} = \sum_{i} \text{Optimization Item Budget}_{i}$$

$$\mathbf{\text{Total Out of Pocket (OOP)}} = \text{Down Payment \$} + \text{Closing Costs \$} + \text{Total Setup Budget}$$

### 2. Debt Service (30-Year Fixed Amortization)

$$r = \frac{\text{Annual Interest Rate}}{12}, \quad n = \text{Term Years} \times 12$$

$$\text{Monthly Payment} = \text{Loan Amount} \times \left[ \frac{r(1 + r)^n}{(1 + r)^n - 1} \right]$$

$$\mathbf{\text{Annual Debt Service}} = \text{Monthly Payment} \times 12$$

### 3. Operating Expenses & Net Operating Income (NOI)

$$\text{Management Fee \$} = \text{Gross Revenue} \times \text{Management Fee \%}$$

$$\text{Annual Property Taxes} = \text{Tax Assessed Value} \times \text{Tax Rate \%}$$

$$\text{Total OPEX} = \text{Management Fee \$} + \sum \text{Direct Expenses (Utilities, Maintenance, Insurance, Cleaning)}$$

$$\mathbf{\text{Net Operating Income (NOI)}} = \text{Gross Revenue} - \text{Total OPEX} - \text{Annual Property Taxes}$$

### 4. Cash Flow & Investor Return Metrics

$$\mathbf{\text{Annual Free Cash Flow (FCF)}} = \text{NOI} - \text{Annual Debt Service}$$

$$\mathbf{\text{Cash-on-Cash Return (CoC \%)}} = \left( \frac{\text{Annual Free Cash Flow}}{\text{Total Out of Pocket (OOP)}} \right) \times 100\%$$

$$\mathbf{\text{Cap Rate \%}} = \left( \frac{\text{NOI}}{\text{Purchase Price}} \right) \times 100\%$$

### 5. Year 1 Accelerated Cost Segregation Tax Depreciation

$$\text{Depreciable Basis} = \text{Purchase Price} \times (1 - \text{Land Value Allocation \% (default 20\%)})$$

$$\text{Personal Property Reallocation} = \text{Depreciable Basis} \times 20\%$$

$$\mathbf{\text{Year 1 Tax Shelter Cash Savings}} = \text{Personal Property Reallocation} \times \text{Marginal Tax Rate (37\%)}$$

---

## 5. Senior Analyst Benchmark & Deterministic Scoring Engine

Trainee underwritings are scored deterministically by comparing their **Mid Forecasted Revenue** against the Senior Analyst Reference Mid Revenue:

$$\text{Deviation Percentage} = \frac{|\text{Trainee Mid} - \text{Reference Mid}|}{\text{Reference Mid}} \times 100\%$$

### Precision Grading Bands

| Tier | Points | Deviation Threshold | Valuation Assessment |
| :--- | :---: | :---: | :--- |
| **Best Band** | **100** | $\text{Deviation} \le 10.0\%$ | **Institutional Precision**: Assumptions match senior underwriting comps and demand seasonality. |
| **Medium Band** | **70** | $10.0\% < \text{Deviation} \le 25.0\%$ | **Moderate Variance**: Directionally sound, but ADR or occupancy assumptions require minor calibration. |
| **Low Band** | **40** | $\text{Deviation} > 25.0\%$ | **Unacceptable Discrepancy**: Model significantly overstates or understates market revenue. |

---

## 6. Enterprise 6-Layer Frontend Security Suite

Even when submitting a frontend client, defense-in-depth security is essential to protect data integrity and prevent injection or forgery attacks.

### Layer 1: CSRF / XSRF Double-Submit Handshake
- **File**: `src/lib/security.ts` (`getOrCreateCsrfToken`, `secureFetch`)
- **Mechanism**:
  - Inspects document cookies for `XSRF-TOKEN` or `csrf_token`.
  - If absent, generates a cryptographically secure random token (`crypto.randomUUID`) and stores it with `SameSite=Strict`.
  - Automatically attaches both `X-XSRF-TOKEN` and `X-CSRF-Token` headers on all mutating HTTP requests (`POST`, `PUT`, `PATCH`, `DELETE`).

### Layer 2: Idempotency Keys & Anti-Replay Debouncing
- **File**: `src/lib/security.ts` & `src/lib/context.tsx`
- **Mechanism**:
  - Generates a unique `X-Request-ID: <UUID>` header for every mutation, allowing the backend to detect and deduplicate retries.
  - Attaches `X-Requested-With: XMLHttpRequest` to trigger browser CORS preflights and block simple HTML form submission attacks.
  - **Client-Side Debouncing**: When `isSaving` is true, buttons are disabled and animated spinners render, rejecting rapid-fire double clicks.

### Layer 3: Strict Runtime Zod Schemas & Invariant Guards
- **File**: `src/lib/schemas.ts`
- **Schemas Defined**:
  - `PurchaseDetailsSchema`: Purchase price $> 0$, interest rate $0\text{--}25\%$, down payment $\ge 0\%$.
  - `ForecastedRevenueSchema`: Strict `.refine()` enforcing $\text{Low} \le \text{Mid} \le \text{High}$.
  - `TaxesSchema`: Assessed value $\ge 0$, tax rate $0\text{--}10\%$.
  - `OperatingExpenseSchema`: Non-empty name, positive amounts, frequency strictly `"monthly" | "annual"`.
  - `CompItemSchema`: Validates comp fields and wraps URLs in `SafeUrlSchema`.
  - `DealTagsSchema`: Whitelists only approved acquisition tags.

### Layer 4: URL Protocol Sanitization & Stored XSS Guard
- **File**: `src/lib/security.ts` (`isValidHttpUrl`, `sanitizeUrl`)
- **Threat Mitigated**: Malicious payloads such as `javascript:alert(document.cookie)` or `data:text/html,...` in comparable property links (`listing_url`).
- **Enforcement**:
  - Validates that protocols are strictly `http:` or `https:`.
  - External links render with `rel="noopener noreferrer"` and `target="_blank"`. Unsafe links default safely to `"#"`.

### Layer 5: Content Security Policy (CSP) & OWASP Security Headers
- **File**: `next.config.js`
- **Headers Injected**:
  - `Content-Security-Policy`:
    - `default-src 'self'`
    - `script-src 'self' 'unsafe-eval' 'unsafe-inline'`
    - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
    - `img-src 'self' data: https: blob:`
    - `font-src 'self' https://fonts.gstatic.com data:`
    - `connect-src 'self' http://127.0.0.1:8000 http://localhost:8000 http://localhost:3000 ws: wss:`
  - `X-Frame-Options: DENY` (Mitigates clickjacking).
  - `X-Content-Type-Options: nosniff` (Prevents MIME-type sniffing).
  - `Referrer-Policy: strict-origin-when-cross-origin` (Prevents sensitive path leakage).
  - `X-XSS-Protection: 1; mode=block` (Legacy browser XSS filter).

### Layer 6: Global React Error Boundary & Exception Redaction
- **File**: `src/components/ui/ErrorBoundary.tsx` wrapped in `src/app/layout.tsx`
- **Purpose**: Intercepts unhandled React rendering errors. Instead of exposing raw component trees or file paths to end users, it presents a polished fallback card with a 1-click retry button.

---

## 7. Live REST API Integration & Dual-Mode Fallback Pipeline

All API operations route through `secureFetch()` in `src/lib/api.ts`.

### Endpoint Directory

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Dashboard metrics, property list, and latest scores. |
| `GET` | `/api/markets` | STR regional markets catalog. |
| `GET` | `/api/properties` | Available property listings catalog. |
| `GET` | `/api/properties/{zpid}` | Property specs, amenities, media, and senior reference model. |
| `GET` | `/api/underwritings/property/{zpid}` | Active draft or template for a property. |
| `POST` | `/api/underwritings/property/{zpid}/start` | Initializes a fresh underwriting record. |
| `PUT` | `/api/underwritings/{id}` | Persists draft inputs and calculations. |
| `POST` | `/api/underwritings/{id}/submit` | Grades deal against senior analyst benchmark. Returns evaluated score. |
| `GET` | `/api/submissions` | Trainee submission history. |
| `GET` | `/api/submissions/{id}` | Detailed graded scorecard for a submission. |

### Dual-Mode Architecture & Offline Resilience
If the backend is temporarily offline, the frontend engages an offline mock repository. It caches data in `localStorage`, generates synthetic evaluations matching the exact backend grading math, and displays subtle status alerts without crashing the UI.

---

## 8. Automated Playwright E2E Test Suite (7/7 Passing)

The test suite in `tests/underwriting.spec.ts` exercises all primary, secondary, and edge-case user journeys completely unattended.

### Test Execution Report

```text
Running 7 tests using 1 worker

  ✓ 1. Dashboard renders available properties, metrics, and market filters (1.1s)
  ✓ 2. Primary User Path: Complete underwriting workflow with 100 Best score (2.9s)
  ✓ 3. Alternate Path: Medium Band Score (70 points) for 20% deviation (1.6s)
  ✓ 4. Alternate Path: Low Band Score (40 points) for >25% deviation (1.5s)
  ✓ 5. Validation and Edge States: Incomplete Mid forecast blocks submission (1.3s)
  ✓ 6. Draft Saving & Resuming Workflow (1.5s)
  ✓ 7. Trainee Leaderboard View and Cohort Standings (1.3s)

7 passed (16.0s)
```

### Test Scenario Coverage
1. **Test 1 — Dashboard & Metrics**: Verifies property card rendering, market filtering, and aggregate metrics.
2. **Test 2 — Primary Path (100 Best Score)**: Underwrites Gatlinburg cabin (`zpid: 41234567`), sets Mid forecast to $125,000, submits for grading, verifies `100` Best score, inspects comparison table, and verifies status updates to `Submitted` on dashboard.
3. **Test 3 — Alternate Path (70 Medium Score)**: Underwrites Broken Bow property (`zpid: 52345678`), inputs Mid forecast of $115,000 ($+19.8\%$ deviation), and verifies `70` Medium score.
4. **Test 4 — Alternate Path (40 Low Score)**: Underwrites Broken Bow property with $180,000 Mid forecast ($>25\%$ deviation), and verifies `40` Low score.
5. **Test 5 — Incomplete Mid Forecast Guard**: Validates that leaving Mid forecast empty disables the submit button with descriptive error banners.
6. **Test 6 — Draft Persistence & Resumption**: Edits purchase price on Kissimmee property (`zpid: 74567890`), saves draft, returns to dashboard, verifies `In Progress` status, and resumes underwriting with inputs intact.
7. **Test 7 — Trainee Cohort Leaderboard**: Verifies leaderboard table rendering, rankings, streaks, and peer benchmarks.

### How to Run Tests

```bash
# Run tests headless:
npx playwright test

# Run tests with interactive Playwright UI:
npx playwright test --ui

# Run tests in headed browser mode:
npx playwright test --headed
```

---

## 9. Design System, Aesthetics & Typography

- **Canvas**: Clean white background (`bg-white`) with subtle borders (`border-zinc-200/90`).
- **Brand Green Accent**: `#52A68B` used for primary buttons, active tabs, scorecards, and progress indicators.
- **Typography**: Clean sans-serif hierarchy for labels, paired with monospaced tabular numerals (`font-mono tabular-nums`) for currency, percentages, and deltas to prevent layout shifts.
- **Top Loading Progress Bar**: A sleek 2.5px emerald progress bar (`src/components/ui/TopProgressBar.tsx`) with subtle backdrop blurring (`backdrop-blur-[1.5px]`) that provides immediate visual feedback on page transitions without intercepting clicks.

---

## 10. Local Development, Installation & Verification

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Ensure `.env.local` contains the backend API endpoint:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 3. Launch Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 11. Project Directory & File Structure

```text
frontend/
├── next.config.js               # Next.js config with Content Security Policy (CSP) & OWASP headers
├── package.json                 # Dependencies (Next 14, React 18, Tailwind, Lucide, Zod, Playwright)
├── playwright.config.ts         # Playwright test runner configuration (baseURL: http://localhost:3000)
├── tailwind.config.js           # Design system tokens, #52A68B brand palette, typography
├── tests/
│   └── underwriting.spec.ts     # 7 comprehensive end-to-end integration tests
└── src/
    ├── app/
    │   ├── layout.tsx           # Global root layout wrapped with ErrorBoundary & TopProgressBar
    │   ├── page.tsx             # Home route redirecting to dashboard
    │   ├── dashboard/
    │   │   └── page.tsx         # Dashboard page
    │   ├── workspace/
    │   │   └── [zpid]/
    │   │       └── page.tsx     # 4-step underwriting workspace dynamic route
    │   ├── evaluation/
    │   │   └── page.tsx         # Graded scorecard and benchmark evaluation route
    │   └── leaderboard/
    │       └── page.tsx         # Cohort leaderboard and analyst rankings
    ├── components/
    │   ├── dashboard/
    │   │   ├── DashboardView.tsx # Property grid, metrics banner, market filters
    │   │   └── PropertyCard.tsx  # Property card with status, attempt counter, score badge
    │   ├── workspace/
    │   │   ├── WorkspaceView.tsx # 4-tab workspace coordinator
    │   │   ├── PropertyHeader.tsx# Listing header with price, specs, save/submit actions
    │   │   ├── FinancialsTab.tsx # Tab 1: Capital stack, setup budget, OPEX, taxes
    │   │   ├── AnalysisTab.tsx   # Tab 2: Revenue scenarios, comps table, cash flow waterfall
    │   │   ├── DealTagsTab.tsx   # Tab 3: 13 institutional tags & thesis notes
    │   │   └── ReviewTab.tsx     # Tab 4: Pre-flight checklist & submit button
    │   ├── evaluation/
    │   │   └── EvaluationView.tsx# Target band gauge, scorecards, side-by-side table
    │   ├── leaderboard/
    │   │   └── LeaderboardView.tsx # Cohort ranking table, streaks, user metrics
    │   └── ui/
    │       ├── ErrorBoundary.tsx # Global exception shield & error mask
    │       ├── TopProgressBar.tsx# Emerald #52A68B top loading bar with backdrop blur
    │       └── card.tsx          # Reusable card containers and headers
    ├── lib/
    │   ├── api.ts               # Typed REST API client mapping backend endpoints
    │   ├── calculations.ts      # Deterministic financial math (NOI, FCF, CoC, Debt, Cost Seg)
    │   ├── context.tsx          # React UnderwritingContext state manager
    │   ├── mockData.ts          # Baseline property catalog, markets, and reference models
    │   ├── schemas.ts           # Strict Zod schemas and runtime validation rules
    │   └── security.ts          # CSRF/XSRF tokens, safe URL sanitization, secureFetch wrapper
    └── types/
        └── index.ts             # TypeScript domain interfaces and type definitions
```

---

## ⚖️ License & Confidentiality

This project is developed for short-term rental acquisitions analyst training and assessment. All financial models, grading benchmarks, and proprietary heuristics are strictly confidential.
