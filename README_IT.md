# BikeTracking


__BikeTracking__ è un app Android di tracciamento GPS delle attività ciclistiche realizzata da uno sviluppatore appassionato di bicicletta.

Ho realizzato questa app puntando esclusivamente alle funzionalità che ritengo necessarie ed importanti sulla base della mia esperienza di ciclista amatoriale, eliminando tutto ciò di superfluo presente nelle altre app simili, come ad esempio social sharing, allenamenti vocali, condivisione della posizione.

Inoltre l'app mantiene le tracce GPS all'interno del dispositivo, __senza inviare e salvare su server esterni__ i tuoi dati della localizzazione.

Per quanto riguarda il calcolo online dell' altitudine, per l' Europa utilizzo un servizio da me realizzato che non memorizza le coordinate degli utenti ma le utilizza esclusivamente determinare il valore DEM (Digital Elevation Measure), mentre fuori dall'Europa utilizzo un servizio analogo fornito da MapBox ([leggi la PRIVACY](./PRIVACY_IT.md)).

# Funzionalità

- misurazione in tempo reale di __distanza__ percorsa, __durata__, __velocità__ e __media__

- calcolo dell' altitudine online via __DEM__ (Digital Elevation Measuring). In Europa con la migliore precisione possibile: 25m di risoluzione con precisione verticale: +/- 7 metri (__GEOTIFF EU-DEM__ di __Copernicus__)

- rotta su __mappa realtime in 3D__ 

- integrazione con __cardiofrequenzimetri__ e __cadenzimetri__ via BLE (Bluethoot Low Energy)

- previsioni meteo via https://open-meteo.com

- riepilogo dati traccia via voce 

- storico delle tracce con __statistiche__, __grafici__ e mappa

## Supporto

* abbonati ad una sottoscrizione in [github sponsors](https://github.com/sponsors/heyteacher)
* fai una donazione [liberapay](https://liberapay.com/heyteacher)
* usa [github issues](https://github.com/heyteacher/biketracking/issues) per __segnalare malfunzionamenti__ o __richieste nuove funzionalità__

