import React from 'react'
import './App.css'
import GetStarted from './pages/GetStarted'
import CreateProject from './pages/CreateProject'
import WelcomePage from './pages/WelcomePage'
import ProjectStep1 from './pages/ProjectStep1'
import ProjectStep2 from './pages/ProjectStep2'
import ProjectStep3 from './pages/ProjectStep3'
import ProjectStep4 from './pages/ProjectStep4'
import ProjectStep5 from './pages/ProjectStep5'
import ProjectStep6 from './pages/ProjectStep6'
import ProjectStep7 from './pages/ProjectStep7'
import TopDown from './pages/TopDown'
import ProjectViz from './pages/ProjectViz'
import Nav from "./components/Nav"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ReactKeycloakProvider } from "@react-keycloak/web"
import keycloak from "./Keycloak"
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
                    {/* Step 0 is also using createproject page, as a way of editing project info */}
                    <Route path="/project/:projectId/step/0" element={<CreateProject />} />
                    <Route path="/project/:projectId/step/1" element={<ProjectStep1 />} />
                    <Route path="/project/:projectId/step/2" element={<ProjectStep2 />} />
                    <Route path="/project/:projectId/step/3" element={<ProjectStep3 />} />
                    <Route path="/project/:projectId/step/4" element={<ProjectStep4 />} />
                    <Route path="/project/:projectId/step/5" element={<ProjectStep5 />} />
                    <Route path="/project/:projectId/step/6" element={<ProjectStep6 />} />
                    <Route path="/project/:projectId/step/7" element={<ProjectStep7 />} />
                    <Route path="/project/:projectId/step/8" element={<TopDown />} />
                    <Route path="/project/:projectId/viz" element={<ProjectViz />} />
                </Routes>
            </BrowserRouter>
        </ReactKeycloakProvider>
    </div>
  )
}

export default App
