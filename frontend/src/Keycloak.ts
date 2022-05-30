import Keycloak from "keycloak-js";
const keycloak = new Keycloak({
  "realm": "myc-convert",
  "url": "http://0.0.0.0:8080/",
  "clientId": "react-web-app"
});

export default keycloak;
