# Short-Term Rental Underwriting Training Platform

A minimal, high-clarity underwriting training interface for short-term rental (STR) acquisitions analysts, built with **Next.js App Router**, **Tailwind CSS**, and **TypeScript**.

---

## 🌟 Executive Overview & Domain Context

Underwriting answers a single core question: **If an investor buys this property and rents it to short-term guests, will it make money, and how much?**

The application models this chain:
1. **Upfront Cost**: Purchase financing (down payment + closing costs) + Capital optimization setup budget (furniture, hot tub, game room, etc.) = **Total Out of Pocket (OOP)**.
2. **Annual Operations**: Low, Mid, and High gross revenue scenarios minus operating expenses (OPEX) and debt service = **Annual Free Cash Flow**.
3. **Return on Capital**: Free cash flow divided by Total OOP = **Cash-on-Cash Return (CoC)**, augmented by first-year accelerated cost segregation tax depreciation savings.

Trainees underwrite blind. On submit, the deterministic grading engine compares the trainee's **Mid revenue forecast** against the senior analyst reference:

$$\text{deviation} = \frac{|\text{trainee Mid} - \text{reference Mid}|}{\text{reference Mid}}$$

- **Best (100 points)**: Deviation $\le 10\%$
- **Medium (70 points)**: Deviation $\le 25\%$
- **Low (40 points)**: Deviation $> 25\%$ or missing

---

## 🏗️ Architecture & Stack

- **Framework**: Next.js 14 (App Router, React 18, React Context)
- **Styling**: Tailwind CSS (Strict White Background Aesthetic, Minimalist Slate Palette, High Data Legibility)
- **Icons**: Lucide React
- **Data Engine**: Reactive client-side mock repository with persistent `localStorage` cache and mathematical parity with the FastAPI/Postgres backend.
- **Testing**: Playwright End-to-End Test Suite

---

## 🚀 Quickstart & Setup

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Development Server

Start the local development server at `http://localhost:3000`:

```bash
npm run dev
```

### 3. Production Build

```bash
npm run build
npm run start
```

---

## 🧪 Autonomous Playwright Testing

The test suite runs completely unattended with controlled, deterministic mock states across all assessment rubric requirements.

### Run Suite Command

```bash
# In frontend directory:
npx playwright test
```

To run with interactive UI or headed browser:
```bash
npx playwright test --ui
# or
npx playwright test --headed
```

### Test Coverage Highlights

1. **Primary User Path**: Select property $\to$ Review Market context $\to$ Adjust Financing & Setup Budget $\to$ Enter Revenue Scenarios $\to$ Toggle Deal Tags $\to$ Pre-submission validation audit $\to$ Submit $\to$ Verify 100 Best Score & side-by-side analyst comparison.
2. **Alternate Paths**:
   - Medium Band (70 points) for $20\%$ deviation.
   - Low Band (40 points) for $>25\%$ deviation.
3. **Validation & Edge States**:
   - Missing Mid revenue blocks submission with descriptive errors.
   - Inverted revenue hierarchy (Low > Mid) triggers inline validation guards.
4. **Draft Saving & Resumption**:
   - Edits are saved to local state, reflected as "In Progress" on dashboard, and resumed accurately.
5. **Cohort Leaderboard**:
   - Real-time ranking updates dynamically based on trainee score and streak.

---

## 📐 Design & Workflow Decisions

### 1. Minimalist White Background (`design bg white`)
- Underwriting involves heavy numerical density (cash flows, loan terms, depreciation percentages). A clean `#ffffff` canvas with subtle slate borders (`#e2e8f0`) minimizes eye fatigue and cognitive clutter.

### 2. Market Context First
- Each property belongs to a distinct demand region (e.g. Smoky Mountains cabin vs. Kissimmee theme-park home). Highlighting market dynamics upfront prevents trainees from applying flat ADR rules across incompatible markets.

### 3. Progressive Disclosure
- The workspace is partitioned into 4 logical steps:
  1. **Financials**: Capital cost foundation (debt, setup, opex, taxes).
  2. **Analysis**: Revenue forecasting and dynamic return waterfalls.
  3. **Deal Tags**: 13 qualitative tags and trainee investment thesis.
  4. **Review & Submit**: Interactive pre-flight audit checklist ensuring zero broken submissions.

### 4. Explanatory Scoring
- Scores are not presented as an isolated badge. The evaluation screen delivers the exact percentage variance ("+3.2% above analyst"), visual target bands, and a side-by-side line item comparison so trainees understand precisely where their assumptions diverged.
