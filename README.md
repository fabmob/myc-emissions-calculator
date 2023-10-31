# MobiliseYourCity Emissions Calculator - Web version

The **MobiliseYourCity Emissions Calculator** aims at helping developing countries and cities to calculate transport GHG emissions for a reference year and Business-as-usual scenario (BAU) as well as a climate scenario with emission reductions from mitigation measures – the so called climate scenario. More info: https://www.mobiliseyourcity.net/mobiliseyourcity-emissions-calculator

The original MobiliseYourCity Emissions Calculator tool is an excel spreadsheet. The goal of this project is to convert it to a web version.

## Why convert to the web

Moving the project to the web allows for a better maintainability and opens up to new features:
* Data can be shared between projects
* User accounts to save and store data
* The way data is filled can be improved (user on-boarding)
* Detailing the way computations are made
* Easier external contributions
* Creating specific access for partners wanting to track usage of the tool
* Ex-post integration
* Better contact between users and MYC

## Who is behind the project

The original tool was developed by the German [Institute for Energy and Environmental Research (IFEU)](https://www.ifeu.de/) for [MobiliseYourCity](https://www.mobiliseyourcity.net).

The web version of the tool is orchestrated and created by [La Fabrique des Mobilités](https://lafabriquedesmobilites.fr/), with financial help from the [French Development Agency (AFD)](https://www.afd.fr/fr) and valuable inputs from IFEU, MYC and the tool's users and reusers.

## Scope of the project

An MVP has been defined during the first quarter of 2022, the web version will begin by focusing on:
* Targeted at consulting firms helping cities (not countries)
* Focused on GHG estimation for BAU (First sheet, 1A)
* Focused on passengers (no freight)

**With the following features:**
* Select country/city and reference year
* Create used accounts to specify profile type, save and track data
* **Proper presentation of the tool**
* A welcome page, with description of the tool, its goals and its relation to MYC
* Compute GHG emissions (using the ASIF methodology) with the following parameters:
    * Vehicules-kilometers travelled (vkt)
    * Occupancy and average trip length per vehicle type
    * Vkt per fuel type
    * Average energy consumption and energy efficiency
    * CO2 impact of electricity
* Improve the way data is filled
    * Progress bar to track data collection journey
    * Help in the choice of category of transport
    * Guide users in their inputs
    * Add a contact email or a way of reaching the MYC team
* Predict emissions increase based on economic and travel growth between now and 2050 if nothing is done (Business As Usual)
* **Visualize output data as graphs**
* Ease the understanding of computations

In 2023, the **version MVP2 was released**, complementing the scope to match the functionnalities of the excel spreadsheet. The following features were included:
* Complete rework of the Inventory & BAU steps described in the first MVP. A project is now divided in three steps
    1. An inventory, focused only on the reference year. This is were vehicles and fuels are defined
    2. A Business as Usual (BAU) scenario, built on top of the inventory 
    3. One or more Climate scenarios, to be compared to the BAU
    * Each step includes a small résults page, to identify potential problems in data
* Full rework of the User Interface
* **Match the features of the latest version of the offline tool (excel)**
    * This includes an update on computation methods, filling option, new types of fuels such as hydrogen and an update of default emission factors
* Creation of an **educational path** based on the MYC guides and notes from the Excel tool, including:
    * Explanatory and illustrated texts of various calculation methods
    * Description of the required data for each step
    * Detailed tooltips for each parameter
    * Concise formulas for intermediate calculations
    * Guidance on how data can be filled
* Addition of a source entry and management system for each data point
* Addition of a **note-taking field** on each page, providing a space to summarize assumptions and back-of-the-envelope calculations
* Unlike MVP1, the tool now supports the input of **climate scenarios**, with or without prior calculations
* Addition of a page for **comparing different scenarios**
    * This page contains a set of configurable graphs, exportable as PNG images or CSV files
    * It also includes a summary of the sources used in the project
    * Finally, it allows for downloading all data entered into the tool in CSV format. This export facilitates the transition from the online tool to Excel if necessary
* Similar to MVP1, a project can be "validated", making it visible to other users
* Unlike MVP1, population and GDP data have been removed since they are not used in emissions calculations

2023 also includes the release of the **version 2.1 - Community Edition**, built with **volunteer work** from various contributors
* Redesign of the tool's introduction page, now more visually appealing
* Addition of new illustrations, icons, and a typeface in line with the MYC graphic design
* Significant work has been done to standardize all interface pages, accompanied by various visual enhancements 
    * For example, uniform cell sizes in tables and improved handling of text and number overflows have been implemented
* These improvements affect all visible pages, as well as dynamic elements like tooltips and popups
* In addition to numerous interface changes, a few bugs have been fixed:
    * Added support for HTTPS for a more secure browsing experience
    * Fixed a bug that prevented project creation under certain conditions
    * Corrected an incorrect vkt calculation based on the order of inventory filling in "fleet" mode
    * Fixed project deletion

More information, and illustrations for the above list can be found on the [Fabrique des Mobilités' wiki entry](https://wiki.lafabriquedesmobilites.fr/wiki/MYC_GHG_Emissions_Calculator).
## Technical aspects

The project is divided in a backend and a frontend, both written in `typescript`

* The backend is a nodejs API server based on `Expressjs`
* The frontend uses `CreateReactApp`

Authentication of users and requests is done using `Keycloak`. The setup of the keycloak server is considered out of scope for now.

Data is saved in an `sqlite3` database.

### Installation

**Backend**

```bash
# Install dependencies
npm install
# Create an output folder
mkdir compile
# Compile and start
npm start
```

The `npm start` script runs the local typescript compilation binary and launches the server: `node_modules/typescript/bin/tsc && node compile/index.js`

The API is then accessible on http://localhost:8081

A specific port can be specified using the `PORT` environment variable:
```
PORT=8081 node compile/index.js
```

**Frontend**
```bash
# Move to correct folder
cd frontend
# Install dependencies (force is required for rechart compatibility with react 18+)
npm install --force
# Compile and start
npm start
```

The frontend is then accessible on http://localhost:3000

To deploy on a non-development environment, it is recommended to build the frontend with `npm run build` and serve it using the backend. The backend is configured to statically serve files in the `frontend/build/` folder.

Configurations such as backend URL can be edited in the `frontend/.env` file.

### Contributing

Contributions to this project are welcomed, be sure to check [CONTRIBUTING.md](CONTRIBUTING.md) for more details.
