# BudgetBuddy
Este o aplicație mobilă multiplatformă care reprezintă o soluție modernă pentru creșterea economiilor, prin urmărirea financiară a cheltuielilor și veniturilor personale.
Aplicația este disponibilă pe iOS și Android, oferind utilizatorilor libertatea de a-și monitoriza bugetul într-un mod rapid și simplu.

# Funcționalități
1. Bază de date locală robustă
2. Categorii predefinite de cheltuieli și venituri
3. Sistem de gestiune a sesiunilor unice ale utilizatorilor autentificați, prin intermediul unui token UUID v4 generat (Stocat atât în AsyncStorage, cât și în Realm DB).
4. Generarea datelor calendaristice și implementarea filtrelor de perioadă - Filtrare după zile, săptămâni, luni, ani, total
5. Adăugarea cheltuielilor și a veniturilor după categorii predefinite (calculator pentru sumă, configurarea perioadei, descriere)
6. Vizualizarea în timp real a datelor în interfața grafică prin intemediul diagramei, balanței, mesajelor sugestive, rapoartelor, veniturilor și cheltuielilor totale
7. Filtrarea datelor după perioadă și categoriile active
8. Accesarea istoricului tranzacțiilor (fiecare categorie poate avea tranzacții multiple); sortarea acestora după sumă, categorii, dată calendaristică; posibilitatea de ștergere
9. Convertirea monedei (EUR/RON)
10. Actualizarea în timp real a aplicației după preferințele utilizatorului

# Rularea aplicației
1. Se va deschide un terminal pentru configurarea proiectului;
2. Crearea proiectului: **npx create-expo-app RealmApp --template @realm/expo-template**;
3. Instalarea Realm: **npm install realm realm/@react**;
4. Instalarea dependințelor și biltiotecilor necesare (vezi _Biblioteci utilizate_) prin **npm install**;
5. Instalarea Expo: **npm install expo-dev-client**;
6. Înainte de build creați un cont pentru a vă conecta la server-ul pentru build **Expo**;
    6.1 Build pe emulator Android: asigurați-vă că aveți deja configurat un dispozitiv pentru emulare cu un SDK cu versiunea >= 33 și API-ul folosit pe dispozitiv are versiunea >= 33;
    6.2 Build pe dispozitiv fizic Android prin USB Debugging: asigurați-vă că aveți descărcat **Expo** pe dispozitivul mobil, aveți dispozitivul pe Developer Mode și aveți dispozitivul conectat USB la PC;
    6.3 Build pe dispozitiv fizic iOS prin USB Debugging: asigurați-vă că aveți descărcat **Expo** pe dispozitivul mobil, aveți dispozitivul pe Developer Mode, aveți dispozitivul conectat USB la PC, cumpărați Apple Developer Enrollment, înregistrați-vă dispozitivul pentru a continua configurarea pentru build și compilați prin **eas build -p ios --profile development/release/production** în cazul în care folosiți Windows;
7. Rularea Expo pentru build-ul de dezvoltare basic: **npx expo start --dev-client**;
    6.1 Rularea Expo pentru build de dezvoltare Android: **npx expo run:android**;
    6.2 Rularea Expo pentru build de dezvoltare iOS: **npx expo run:ios**;
8. Pentru build-ul de producție, asigurați-vă că aplicația nu are erori la compilare și că sunteți înregistrați la serverul Expo CLI pentru compilarea de producție;
9. Rulați comanada: **eas build -p ios/android --profile release production**;
    9.1 În cazul build-ului pe iOS, conectați-vă la contul de Apple Developer pentru a continua compilarea (fară un cont valid nu va funcționa);
10. Odată ce compilarea s-a finalizat cu succes, veți avea fișierul creat pe server-ul **expo.dev**;
11. În cazul build-ului de producție pe Android, se va genera un fișier AAB (Android App Bundle);
    11.1 Pentru a îl instala este nevoie de **Bundle Tool** (https://github.com/google/bundletool/releases);
    11.2 Rulați în terminal comanda pentru generarea APK: java -jar bundletool-all.jar build-apks --bundle=path/to/your.aab --output=output/path/to/your.apks --mode=universal;
    11.3 Rulați în terminal comanada pentru generarea unui Keystore: keytool -genkeypair -v -keystore your-keystore.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000;
    11.4 Instalarea APK-ului pe dispozitiv (USB Debugging este necesar): java -jar bundletool-all-1.16.0.jar build-apks --bundle="D:/bulding app/application-f4842747-4faa-46b8-a17e-3fcc08454964.aab" --output="D:/bulding app/BudgetBuddy1.0.apks" --mode=universal --ks="D:/bulding app/andrj.keystore" --ks-pass=pass: --ks-key-alias= --key-pass=pass:;
12. În cazul build-ului de producție pe iOS, se va genera un fișier IPA (iOS AppStore Package);
    12.1 Dacă aveți un dispozitiv Apple ce rulează macOS, veți instala aplicația folosind XCode și Apple Configurator 2. Odată ce dați drag-and-drop la fișierul IPA pe dispozitivul mobil iOS, acesta va fi instalat automat;
    12.2 Cum eu am folosit un PC ce are ca sistem de operare Windows, a fost nevoie sa găsesc un work-around pentru a instala fișierul IPS pe dispozitivul iOS fără a încălca securitatea Apple;
    12.3 Instalați AltStore pe dispozitivul iOS, creați un cont, folosiți contul de la Apple iCloud;
    12.4 Instalați AltStore pe PC (dispozitivul cu sistem de operare Windows), folosiți același cont AltStore și utilizați apoi Apple iCloud;
    12.5 Încăcați fișierul IPA în iCloud, după care deschideți aplicația AltStore pe iOS;
    12.6 Veți găsi în contul dumneavoastră fișierul IPA din iCloud, iar AltStore se va ocupa cu debundle-ul fișierului;
    12.7 Odată ce veți apăsa pe fișier, aplicația se va instala pe dispozitivul iOS;

Aceștia sunt pașii de bază pentru configurarea proiectului, instalarea tehnologiilor, programelor și bibliotecilor necesare pentru a asigura o funcționalitate completă a aplicației atât pe dispozitive Android, cât și pe dispozitive iOS.


# Tehnologii utilizate
Aplicația a fost dezvoltată în React Native, folosind tehnologia Expo pentru a îndeplini caracterul de multiplatformă, dar și pentru emularea și testarea aplicației. De asemenea s-a utilizat Expo pentru build-urile de producție ale aplicației și instalarea acesteia pe dispozitivele mobile.
Node.js a fost utilizat pentru compilarea proiectului și pentru instalarea bibliotecilor necesare pentru implementarea funcționalităților.
S-a implementat o bază de date locală folosind Realm by MongoDB. Nu necesită acces la internet și oferă confidențialitate asupra datelor utilizatorului. 
Pentru o navigare eficientă și performantă s-a utilizat React Navigation v6.
Limbajele de programare utilizate în proiect sunt următoarele: TypeScript (pentru backend), JavaScript și CSS (pentru frontend).

# Biblioteci utilizate
"dependencies": {
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@react-native-community/masked-view": "^0.1.11",
    "@react-native-picker/picker": "^2.6.1",
    "@react-navigation/drawer": "^6.6.7",
    "@react-navigation/native": "^6.1.10",
    "@react-navigation/native-stack": "^6.9.18",
    "@react-navigation/stack": "^6.3.21",
    "@realm/react": "^0.6.2",
    "axios": "^1.6.8",
    "expo": "^49.0.8",
    "expo-app-loading": "^2.1.1",
    "expo-constants": "~14.4.2",
    "expo-dev-client": "~2.4.8",
    "expo-font": "~11.4.0",
    "expo-splash-screen": "~0.20.5",
    "expo-status-bar": "~1.6.0",
    "luxon": "^3.4.4",
    "mathjs": "^12.4.1",
    "react": "18.2.0",
    "react-native": "0.72.4",
    "react-native-alert-notification": "^0.4.0",
    "react-native-drawer-layout": "^3.2.2",
    "react-native-gesture-handler": "^2.16.0",
    "react-native-get-random-values": "~1.9.0",
    "react-native-gifted-charts": "^1.4.7",
    "react-native-modern-datepicker": "^1.0.0-beta.91",
    "react-native-picker-select": "^9.0.1",
    "react-native-reanimated": "^3.8.1",
    "react-native-safe-area-context": "^4.9.0",
    "react-native-screens": "^3.29.0",
    "react-native-segmented-control-tab": "^4.0.0",
    "react-native-svg": "^14.1.0",
    "react-native-swiper": "^1.6.0",
    "react-native-vector-icons": "^10.0.3",
    "realm": "12.0.0",
    "rn-segmented-control": "^1.1.2",
    "uuid": "^9.0.1",
    "victory-native": "^36.9.1"
  },
  "devDependencies": {
    "@babel/core": "^7.22.5",
    "@babel/plugin-proposal-decorators": "^7.22.5",
    "@realm/babel-plugin": "^0.1.1",
    "@types/react": "~18.2.13",
    "react-native-svg-transformer": "^1.3.0",
    "typescript": "^5.1.3"
  },

# App Screenshots
![authteticationScreen](https://github.com/andreicapac/BudgetBuddy/assets/76436642/35c45712-c5bc-4aef-9e75-1da55d30fcc8)

![month1](https://github.com/andreicapac/BudgetBuddy/assets/76436642/f4b2bc05-4560-4138-b71a-7208f8a115a8)

![day1](https://github.com/andreicapac/BudgetBuddy/assets/76436642/65163d2d-cb4b-4c88-867c-e6e28a724707)

![drawer21](https://github.com/andreicapac/BudgetBuddy/assets/76436642/d801738c-d71c-4b01-b4f3-c1e1bf376fd4)

![istoric2](https://github.com/andreicapac/BudgetBuddy/assets/76436642/b12ba2ed-f359-4ef4-a282-a603470b2cc5)

![summary1](https://github.com/andreicapac/BudgetBuddy/assets/76436642/145ec340-d9a4-45fe-82d6-0de07a5cff8f)

![menu2](https://github.com/andreicapac/BudgetBuddy/assets/76436642/9cb2e3c8-cc3b-4adb-99c5-78feed42f4d5)
