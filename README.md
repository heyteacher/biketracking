# BikeTracking

[__BikeTracking__](https://play.google.com/store/apps/details?id=org.biketracking) is a GPS tracking Android app for cycling activities created by a passionate bicycle developer.

I made this app focusing exclusively on the features that I consider necessary and important on the basis of my experience as an amateur cyclist, eliminating everything superfluous present in other similar apps, such as social sharing, vocal training, location sharing.

In addition, the app keeps GPS tracks inside the device, **without sending and saving your location data on external servers**.

As for the online altitude calculation, for Europe I use a service I created that does not store the coordinates of the users but only uses them to determine the DEM (Digital Elevation Measure) value, while outside Europe I use a similar service provided by MapBox ([see PRIVACY](./PRIVACY.md))

[Install BikeTracking from Google Play](https://play.google.com/store/apps/details?id=org.biketracking) 

## Features

* measure realtime __distance__, __duration__, __speed__, __average__
* measure __altitude__ online via __DEM__ (Digital Elevation Measuring). For Europe best precision: 25m resolution with vertical accuracy: +/- 7 meters [Copernicus EU-DEM](https://land.copernicus.eu/imagery-in-situ/eu-dem)
* realtime __routing 3D__ on map
* __heartrate__ and __cadence sensor__ via BLE (Bluethoot Low Energy)
* meteo forecast via https://open-meteo.com 
* __voice track summary__
* history of tracks with statistical data, __charts__ and map

## Support Us

* if you are a developer, please fork repo and fix bugs :-) 
* subscribe a tier on [github sponsors](https://github.com/sponsors/heyteacher)
* make a donation on [liberapay](https://liberapay.com/heyteacher)
* use [github issues](https://github.com/heyteacher/biketracking/issues) for __reporting bugs__ or __requesting features__

# Developers

## Install

* create project
    ```
    tns create trasksport
    npm i @types/jest --devel
    cd tracksport
    tns preview
    ```

* Install NativeScript apps `playground` and `preview` and scan QR Code 

* Install NativeScript extension on VSCode

* Install `adb` (Android Debug Bridge)

* Enable `Developer Mode` in your smartphone

  1. Go to `Settings`, then tap `About device` or `About phone`.
  1. Scroll down, then tap `Build number` seven times
  1. Enter your pattern, PIN or password to enable the Developer options menu.
  1. The `Developer options` menu will now appear in your Settings menu.

* Create `Launch Configuration` for `NativeScript`

* Plug you android and play `Launch on Android`

* configure and commit git
    ```
    git config --global user.email "XXXXXXX@XXX.XXX"
    git config --global user.name "XXX, XXX"
    git add .
    git commit . -m "init commit"
    ```

## Run

* plug USB cable

* run `tns run android`

## nativescript-geolocation

```
npm install @nativescript/schematics
tns plugin add nativescript-geolocation
```

## Release on Playstore

* Create a new app on https://play.google.com/apps/publish
* Generate a bundle
* Upload bundle on store

### generate bubdle

```
tns build android --release --key-store-path ./keys/keystore.jks --key-store-password XXXXX --key-store-alias upload --key-store-alias-password XXXXX --aab --copy-to releases/biketracking.aab
```

### Generate apk

```
tns build android --release --key-store-path ./keys/keystore.jks --key-store-password XXXXX --key-store-alias upload --key-store-alias-password XXXXXX
```

## Publish on Google Play Store

publish via __Microsoft Visual Studio App Center__, after release the first application in [Google Play Console](https://play.google.com/apps/publish/)

1. autenticate into [https://appcenter.ms/](https://appcenter.ms/)

1. create a new app

1. follow istruction to connect [App Center to Google Play Console](https://docs.microsoft.com/en-us/appcenter/distribution/stores/googleplay#setting-up-api-access-clients)

1. install appcenter cli 
   ```
   npm install -g appcenter-cli
   ``` 

1. login appcenter copy and paste browser token
   ```
   appcenter login
   ``` 

1. publish the AAB
   ```
   appcenter distribute stores publish --app <account_name>/<app_name> --file releases/biketracking-<version>.aab --store Production --release-note "minor fixes"
   ```

## Gulp commands

1. update version depending semantic version:
   * bug fix
     ```
     gulp patch 
     ```
   * new features (minor release)
     ```     
     gulp minor  
     ```
   * new mayor release
     ```     
     gulp mayor  
     ```

1. create release notes for new version in `releases/release-notes-X.Y.X.txt`

1. publish on google store 
   ```
   gulp publish
   ```