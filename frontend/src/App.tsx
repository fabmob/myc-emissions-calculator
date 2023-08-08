import React from 'react'
import './App.css'
import Projects from './pages/Projects'
import CreateProject from './pages/CreateProject'
import WelcomePage from './pages/WelcomePage'
import InventoryIntro from './pages/Inventory/InventoryIntro'
import InventoryStep1 from './pages/Inventory/InventoryStep1'
import InventoryStep2 from './pages/Inventory/InventoryStep2'
import InventoryStep3 from './pages/Inventory/InventoryStep3'
import InventoryStep4 from './pages/Inventory/InventoryStep4'
import InventoryStep5 from './pages/Inventory/InventoryStep5'
import InventoryStep6 from './pages/Inventory/InventoryStep6'
import InventoryStep7 from './pages/Inventory/InventoryStep7'
import InventoryStep8 from './pages/Inventory/InventoryStep8'

import BAUIntro from './pages/BAU/BAUIntro'
import BAUStep1 from './pages/BAU/BAUStep1'
import BAUStep2 from './pages/BAU/BAUStep2'
import BAUStep3 from './pages/BAU/BAUStep3'
import BAUStep4 from './pages/BAU/BAUStep4'
import BAUStep5 from './pages/BAU/BAUStep5'

import ClimateIntro from './pages/Climate/ClimateIntro'
import ClimateWithUpstreamStep1 from './pages/Climate/ClimateWithUpstreamStep1'
import ClimateWithUpstreamStep2 from './pages/Climate/ClimateWithUpstreamStep2'
import ClimateWithUpstreamStep3 from './pages/Climate/ClimateWithUpstreamStep3'
import ClimateWithUpstreamStep4 from './pages/Climate/ClimateWithUpstreamStep4'
import ClimateWithUpstreamStep5 from './pages/Climate/ClimateWithUpstreamStep5'
import ClimateWithoutUpstreamStep1 from './pages/Climate/ClimateWithoutUpstreamStep1'
import ClimateWithoutUpstreamStep2 from './pages/Climate/ClimateWithoutUpstreamStep2'
import ClimateWithoutUpstreamStep3 from './pages/Climate/ClimateWithoutUpstreamStep3'
import ClimateWithoutUpstreamStep4 from './pages/Climate/ClimateWithoutUpstreamStep4'
import ClimateWithoutUpstreamStep5 from './pages/Climate/ClimateWithoutUpstreamStep5'
import ClimateWithoutUpstreamStep6 from './pages/Climate/ClimateWithoutUpstreamStep6'
import ClimateWithoutUpstreamStep7 from './pages/Climate/ClimateWithoutUpstreamStep7'

import Nav from "./components/Nav"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ReactKeycloakProvider } from "@react-keycloak/web"
import keycloak from "./Keycloak"
import ProjectSummary from './pages/ProjectSummary'
import ProjectCompare from './pages/ProjectCompare'
// import Footer from "./components/Footer"

function App() {
  return (
    <div className="App">
        <ReactKeycloakProvider authClient={keycloak} initOptions={{onLoad: 'check-sso', silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'}}>
            <BrowserRouter>
                <Nav />
                <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/Projects" element={<Projects />} />
                    <Route path="/createProject" element={<CreateProject />} />
                    {/* config also using createproject page, as a way of editing project info */}
                    <Route path="/project/:projectId/config" element={<CreateProject />} />
                    <Route path="/project/:projectId/edit" element={<ProjectSummary />} />
                    <Route path="/project/:projectId/viz" element={<ProjectCompare />} />

                    <Route path="/project/:projectId/Inventory/intro" element={<InventoryIntro />} />
                    <Route path="/project/:projectId/Inventory/step/1" element={<InventoryStep1 />} />
                    <Route path="/project/:projectId/Inventory/step/2" element={<InventoryStep2 />} />
                    <Route path="/project/:projectId/Inventory/step/3" element={<InventoryStep3 />} />
                    <Route path="/project/:projectId/Inventory/step/4" element={<InventoryStep4 />} />
                    <Route path="/project/:projectId/Inventory/step/5" element={<InventoryStep5 />} />
                    <Route path="/project/:projectId/Inventory/step/6" element={<InventoryStep6 />} />
                    <Route path="/project/:projectId/Inventory/step/7" element={<InventoryStep7 />} />
                    <Route path="/project/:projectId/Inventory/step/8" element={<InventoryStep8 />} />

                    <Route path="/project/:projectId/BAU/intro" element={<BAUIntro />} />
                    <Route path="/project/:projectId/BAU/step/1" element={<BAUStep1 />} />
                    <Route path="/project/:projectId/BAU/step/2" element={<BAUStep2 />} />
                    <Route path="/project/:projectId/BAU/step/3" element={<BAUStep3 />} />
                    <Route path="/project/:projectId/BAU/step/4" element={<BAUStep4 />} />
                    <Route path="/project/:projectId/BAU/step/5" element={<BAUStep5 />} />

                    <Route path="/project/:projectId/Climate/:climateScenarioId/intro" element={<ClimateIntro />} />
                    <Route path="/project/:projectId/Climate/:climateScenarioId/With/step/1" element={<ClimateWithUpstreamStep1 />} />
                    <Route path="/project/:projectId/Climate/:climateScenarioId/With/step/2" element={<ClimateWithUpstreamStep2 />} />
                    <Route path="/project/:projectId/Climate/:climateScenarioId/With/step/3" element={<ClimateWithUpstreamStep3 />} />
                    <Route path="/project/:projectId/Climate/:climateScenarioId/With/step/4" element={<ClimateWithUpstreamStep4 />} />
                    <Route path="/project/:projectId/Climate/:climateScenarioId/With/step/5" element={<ClimateWithUpstreamStep5 />} />
                    <Route path="/project/:projectId/Climate/:climateScenarioId/Without/step/1" element={<ClimateWithoutUpstreamStep1 />} />
                    <Route path="/project/:projectId/Climate/:climateScenarioId/Without/step/2" element={<ClimateWithoutUpstreamStep2 />} />
                    <Route path="/project/:projectId/Climate/:climateScenarioId/Without/step/3" element={<ClimateWithoutUpstreamStep3 />} />
                    <Route path="/project/:projectId/Climate/:climateScenarioId/Without/step/4" element={<ClimateWithoutUpstreamStep4 />} />
                    <Route path="/project/:projectId/Climate/:climateScenarioId/Without/step/5" element={<ClimateWithoutUpstreamStep5 />} />
                    <Route path="/project/:projectId/Climate/:climateScenarioId/Without/step/6" element={<ClimateWithoutUpstreamStep6 />} />
                    <Route path="/project/:projectId/Climate/:climateScenarioId/Without/step/7" element={<ClimateWithoutUpstreamStep7 />} />
                </Routes>
                {/* <Footer /> */}
            </BrowserRouter>
        </ReactKeycloakProvider>
    </div>
  )
}

export default App

