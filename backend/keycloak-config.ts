import session from 'express-session'
import Keycloak from 'keycloak-connect'

let keycloak = <Keycloak.Keycloak><unknown>undefined

const keycloakConfig = {
  "realm": "myc-convert",
  "bearer-only": true,
  "auth-server-url": "https://idpmyc.fabmob.io:8443/",
  "ssl-required": "external",
  "resource": "node-microservice",
  "confidential-port": 0
} as Keycloak.KeycloakConfig

export function initKeycloak() {
    if (!keycloak) {
        let memoryStore = new session.MemoryStore()
        keycloak = new Keycloak({
            store: memoryStore,
        }, keycloakConfig)
    }
    return keycloak
}
