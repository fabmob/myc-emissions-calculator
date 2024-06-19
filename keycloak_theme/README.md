# Keycloak theme
An extension of the keywind theme with a few color changes https://github.com/lukin/keywind

Install by putting the keywind folder in the `/opt/keycloak/themes` folder of the keycloak container.

```
# Example command:
docker cp keywind/ keycloakcontainer:/opt/keycloak/themes/
```

Then select the login theme in the admin menu `Realm Settings` -> `Themes`
