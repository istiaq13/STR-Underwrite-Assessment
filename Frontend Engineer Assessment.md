# **<u>Frontend Engineer Assessment</u>** 

## **1. Project Overview** 

You'll be building the frontend for an underwriting training platform. Our analysts evaluate short-term rental properties (think Airbnb homes) for investors, and this is where new analysts practice that work before they do it for real. 

Here's how it works. A trainee picks a property, fills in the underwriting, and submits it. While they work, they never see the original analyst's version. Once they submit, the API compares their work with that reference's underwriting, returns a score, and the trainee sees where they land on the leaderboard. 

You don't need any real estate background for this. The API already handles every calculation and all of the grading. Your job is the experience around it: a workflow that feels natural, numbers that are easy to read, and forms that hold up when people make mistakes. The rest of this section gives you just enough of the domain for the screens to make sense. Treat it as context, not as something you're being tested on. 

⭐Please build utilizing: <u>Next.js</u> (modern react patterns), Shadcn, tailwind CSS, <u>HERE</u> 

### **Why we underwrite** 

Underwriting answers one main question: if an investor buys this property and rents it to short-term guests, will it make money, and how much? The answer comes from a simple chain: 

- What it costs up front. The down payment, closing costs and setup spend add up to the Total Out of Pocket. 

- What it earns each year. Forecast revenue, minus running costs and the mortgage, gives the Annual Free Cash Flow. 

- How good the return is. Cash flow divided by the money put in gives the Cash-on-Cash return. 

Every part of the workspace feeds one of these three steps. Keep that chain in mind and a lot of your layout decisions get easier. 

Each property also belongs to a market: a region where properties share the same demand patterns, such as Broken Bow, OK or Central Florida. You'll get the market name and a short description with each property. It's a helpful context for the trainee, and there's nothing to fill in. 

### **The underwriting workspace** 

The workspace has three sections: Financials, Analysis and Deal Tags. The API returns more fields than we describe here, and you don't need to show all of them. Focus on the ones below. 

**Financials** ·  what the deal costs 

|Part|What the trainee enters|What it's for|
|---|---|---|
|Purchase & financing|Purchase price (prefilled from the listing),<br>down payment %, interest rate, loan term in<br>years, closing costs %|Works out the loan, the monthly<br>mortgage and the cash needed at<br>closing.|
|Optimization list|One-time setup costs before the first guest<br>arrives, each with a category and an amount.<br>For example furniture, a hot tub or a game<br>room.|Adds to Total Out of Pocket, and to the<br>value that can be depreciated for tax<br>savings.|
|Operating expenses<br>(OPEX)|Recurring monthly costs, each with a name<br>and a monthly amount. For example utilities,<br>internet, insurance, property tax, supplies or<br>software.|Taken out of revenue every year. The<br>Low and High scenarios nudge it<br>slightly (×0.96 and ×1.04).|
|Taxes|Land %, short-life asset multiplier %, bonus<br>depreciation %, tax rate %. Most training deals<br>use 20%, 25%, 60% and 37%.|Estimates the first-year tax savings<br>from depreciation.|



#### **Analysis** ·  what the deal earns 

The trainee enters three annual revenue forecasts: Low, Mid and High, meaning a cautious year, an expected year and a strong year. They also set a co-hosting fee % (if a co-host manages the property) and an annual appreciation % (how much the property's value grows each year). 

From there, the API calculates the results every time you save or submit. These are the ones worth showing clearly: 

|Output|What it means|
|---|---|
|Total Out of Pocket|All the cash the investor puts in on day one: down payment, closing costs and<br>setup spend.|
|Net Operating Income (NOI)|Yearly revenue minus operating expenses and co-hosting fees, before the<br>mortgage.|
|Annual Free Cash Flow|NOI minus a year of mortgage payments. The money the investor actually<br>keeps.|
|Cash-on-Cash|Free cash flow divided by Total Out of Pocket. The headline return, shown for<br>Low, Mid and High.|
|Tax Savings|The estimated first-year tax benefit from depreciation.|
|PRR|Mid revenue divided by purchase price. A quick check of how hard the property<br>works for its price.|



Every formula is written out in the Underwriting Calculations tab, in case you want live previews while the trainee types or want to show how a number was reached. 

One thing to watch: the API sends and receives percentages as fractions, so `0.20` means 20%. The Calculations tab writes percentages as whole numbers (for example `Down Payment % / 100` ), so convert when you move values between the form and the API. 

#### **Deal Tags** ·  yes/no labels 

Deal tags describe the deal at a glance. A toggle or checkbox for each one is plenty, and they don't affect the score. The API field name is in brackets. 

|Turnkey (`turnkey`)|Furnished (`furnished`)|Luxury (`luxury`)|
|---|---|---|
|Tax Efficient (`tax_efficient`)|New Construction<br>(`new_construction`)|Existing Airbnb (`existing_airbnb`)|
|ARV (`arv`)|High Cash-on-Cash<br>(`high_cash_on_cash`)|Low Cash-on-Cash<br>(`low_cash_on_cash`)|
|Add In-ground Pool<br>(`add_inground_pool`)|Waterfront (`waterfront`)|Remote (`remote`)|
|Can Support Co-host<br>(`can_support_cohost`)|||



### **How scoring works** 

The score comes down to one number: the trainee's Mid revenue forecast. The API compares it with the analyst's reference and measures how far off it is: 

<mark>`deviation = | trainee`</mark> `'` <mark>`s Mid forecast` −</mark> <mark>`reference Mid | ÷ reference Mid`</mark> 

|Result|How close the forecast is|Score|
|---|---|---|
|Best|Within 10% of the reference|100|
|Medium|Within 25% of the reference|70|
|Low|More than 25% away, or no forecast at all|40|



Both limits count in the trainee's favor, so a forecast exactly 10% off is still Best. 

To make building and testing easier, here are the exact ranges for every property in the seed data. Use them to walk through each result state yourself and to write Playwright cases for all three outcomes. Anything outside the Medium range scores Low. 

|Property|Reference Mid|Best (100)|Medium (70)|
|---|---|---|---|
|1240 Ski View Dr, Gatlinburg, TN|$125,000|$112,500 – $137,500|$93,750 – $156,250|
|88 Lakeshore Ln, Broken Bow, OK|$96,000|$86,400 – $105,600|$72,000 – $120,000|
|3402 Palm Isle Ct, Kissimmee, FL|$165,000|$148,500 – $181,500|$123,750 – $206,250|
|215 Aspen Ridge Rd, Blue Ridge, GA|$128,000|$115,200 – $140,800|$96,000 – $160,000|



|Property|Reference Mid|Best (100)|Medium (70)|
|---|---|---|---|
|9 Dune Walk, Port Aransas, TX|$192,000|$172,800 – $211,200|$144,000 – $240,000|
|47 Cedar Hollow Rd, Sevierville, TN|$80,000|$72,000 – $88,000|$60,000 – $100,000|



Each submission also comes back with a `breakdown` : the trainee's number, the reference number and the deviation. Use it to explain the score, not just display it. "You were 4% above the analyst" helps a trainee far more than a lone 100. 

That's all the domain knowledge you need. Everything else is yours to shape: how the workflow is sequenced, how the numbers are laid out, how errors show up and how the results feel. That's where we'll be looking most closely. 

## **2. User Workflow** 

1. Open the training dashboard and select an available property. 

2. Review the available property and market information. 

3. Complete the underwriting inputs across the required sections. 

4. Review the calculated outputs and important assumptions. 

5. Submit the completed underwriting. 

6. Review the accuracy score, and leaderboard position. 

7. Run or review the automated Playwright test suite across multiple cases. 

## **3. Required Screens** 

|Screen|Minimum expectation|
|---|---|
|Training dashboard|Show available or assigned properties, completion status,<br>previous scores, progress, and available training cases.|
|Underwriting workspace|Organize the work into three clear sections: Financials<br>(purchase and financing, optimization list, operating<br>expenses, taxes), Analysis (revenue scenarios and the<br>calculated returns) and Deal Tags.|
|Review and submission|Show incomplete fields and invalid inputs.|
|Evaluation results|Show the overall score|



## **4. Autonomous Playwright Testing** 

Choose any meaningful end-to-end feature or workflow in your application and add Playwright coverage. You are free to choose the feature, scope, test data. We value thoughtful selection, reliable execution, and clear reasoning more than the number of tests. 

Your tests should run unattended with deterministic fixtures or controlled mocks. A strong submission covers the primary user path and at least one meaningful alternate, validation, or edge state. 

### **Playwright deliverables** 

- Playwright tests included in the submitted repository. 

- A documented command that runs the suite without manual intervention. 

- A short explanation of the fixture or case-generation strategy. 

- At least one example of a test failure artifact or an explanation of how failures would be debugged. 

You are not required to build an AI system that writes tests. The focus is on autonomous, data-driven execution and reliable frontend coverage. 

## **5. Getting the API running** 

We've built the backend for you, so your time goes into the frontend. All you need installed is **Docker Desktop** , plus Git to clone the repository. Then run: 

- git clone https://github.com/fahimstrsearch/strs_fe_assessment_v1.git 

- cd strs_fe_assessment_v1/backend 

- docker compose up -d --build 

The first start takes a minute or two. Docker builds the API, starts the Postgres database, creates the tables and loads the training data: 4 markets, 6 properties and the analyst's reference underwriting for each property. Every candidate gets exactly the same data, so the score ranges in the table above will match what you see. 

Once it's up, you're ready: 

- **API:** http://localhost:8000 

- **Interactive docs:** http://localhost:8000/docs lists every endpoint and lets you try requests in the browser. It's the quickest way to learn the API. 

- **Quick check:** open http://localhost:8000/api/dashboard and you should see six properties. 

## **6. Deliverables** 

- Working Application 

   - A functional Frontend Prototype covering one complete training case 

- Playwright test suite 

   - Autonomous, data-driven tests with a documented run command. 

- Design Explanation 

   - A short explanation of the main workflow decisions and why the interface is organized as presented 

- Source code 

   - A public git repository with a README file containing setup instructions 

   - 

- 📹Video Walkthrough 

   - A short video walkthrough (10-12min) demonstrating the workflow and important decisions you have made while building the system. 

## **7. Evaluation Rubric** 

|Evaluation area|Weight|What reviewers look for|
|---|---|---|
|Underwriting workflow and product<br>thinking|30%|The workflow is understandable, logically<br>sequenced, and appropriate for analyst<br>training.|
|Visual design and usability|25%|The interface has a clear hierarchy,<br>strong layout, readable data presentation,<br>consistent components, and low cognitive<br>friction.|
|Frontend architecture and component<br>quality|10%|The code is organized, reusable, typed,<br>and structured for a complex internal<br>application.|
|Forms, state, validation, and API<br>integration|10%|Inputs, derived states, API calls,<br>validation, saving, submission, and<br>results are handled coherently.|
|Autonomous Playwright testing|20%|The suite runs unattended across<br>multiple cases and covers core workflow,<br>validation, edge states, evaluation<br>behavior, and useful failure artifacts.|
|Code quality and documentation|5%|The README and implementation<br>explain assumptions, tradeoffs, setup,<br>test strategy, and limitations clearly.|



