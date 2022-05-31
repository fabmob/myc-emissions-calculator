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
# Install dependencies
npm install
# Compile and start
npm start
```

The frontend is then accessible on http://localhost:3000

To deploy on a non-development environment, it is recommended to build the frontend with `npm run build` and serve it using the backend by adding the following line to `index.ts`
```
app.use(express.static(path.join('../frontend', '')));
```

Configurations such as backend URL can be edited in the `frontend/.env` file.

### Contributing

Contributions to this project are welcomed, be sure to check [CONTRIBUTING.md](CONTRIBUTING.md) for more details.
