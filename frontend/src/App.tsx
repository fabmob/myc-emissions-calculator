import React from 'react'
import './App.css'
import GetStarted from './pages/GetStarted'
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

import ProjectViz from './pages/ProjectViz'
import Nav from "./components/Nav"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ReactKeycloakProvider } from "@react-keycloak/web"
import keycloak from "./Keycloak"
import ProjectSummary from './pages/ProjectSummary'
function App() {
  return (
    <div className="App">
        <ReactKeycloakProvider authClient={keycloak} initOptions={{onLoad: 'check-sso', silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'}}>
            <BrowserRouter>
                <Nav />
                <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/getStarted" element={<GetStarted />} />
                    <Route path="/createProject" element={<CreateProject />} />
                    {/* config also using createproject page, as a way of editing project info */}
                    <Route path="/project/:projectId/edit" element={<ProjectSummary />} />
                    <Route path="/project/:projectId/config" element={<CreateProject />} />
                    <Route path="/project/:projectId/Inventory/intro" element={<InventoryIntro />} />
                    <Route path="/project/:projectId/Inventory/step/1" element={<InventoryStep1 />} />
                    <Route path="/project/:projectId/Inventory/step/2" element={<InventoryStep2 />} />
                    <Route path="/project/:projectId/Inventory/step/3" element={<InventoryStep3 />} />
                    <Route path="/project/:projectId/Inventory/step/4" element={<InventoryStep4 />} />
                    <Route path="/project/:projectId/Inventory/step/5" element={<InventoryStep5 />} />
                    <Route path="/project/:projectId/Inventory/step/6" element={<InventoryStep6 />} />
                    <Route path="/project/:projectId/Inventory/step/7" element={<InventoryStep7 />} />
                    <Route path="/project/:projectId/Inventory/step/8" element={<InventoryStep8 />} />
                    <Route path="/project/:projectId/viz" element={<ProjectViz />} />
                </Routes>
            </BrowserRouter>
        </ReactKeycloakProvider>
    </div>
  )
}

export default App
