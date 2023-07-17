import Keycloak from "keycloak-js";
const keycloak = new Keycloak({
  "realm": "myc-convert",
  "url": "https://idpmyc.fabmob.io:8443/",
  "clientId": "react-web-app"
});

export default keycloak;
