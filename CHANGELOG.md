# Changelog

## [1.5.0](https://github.com/alex-bluetrain/mostro-app/compare/mostro-app-v1.4.0...mostro-app-v1.5.0) (2026-09-28)


### Features

* **chat:** always send X-Mostro-Client, web included ([06c1a5a](https://github.com/alex-bluetrain/mostro-app/commit/06c1a5a63409178789b8830a6ef2c90fb919ee20))
* **native:** per-client chat thread, keyboard-aware chat and login ([096d339](https://github.com/alex-bluetrain/mostro-app/commit/096d33995d2c70637da4ee40b55cbf81e676831a))
* **native:** use the web AgentInterface chat on Android ([3ff7c2d](https://github.com/alex-bluetrain/mostro-app/commit/3ff7c2dfcb4f4d21389f33dfe4dbefa9bc86f930))


### Bug Fixes

* **native:** make the status bar follow the in-app theme ([43fa9df](https://github.com/alex-bluetrain/mostro-app/commit/43fa9dfd4b36cc5a0c019cb5492d9190d2fab3fa))

## [1.4.0](https://github.com/alex-bluetrain/mostro-app/compare/mostro-app-v1.3.0...mostro-app-v1.4.0) (2026-09-27)


### Features

* **settings:** add Telegram notifications toggle ([fe3cc62](https://github.com/alex-bluetrain/mostro-app/commit/fe3cc628b1795543cae4b13af1b2c49993454365))
* **settings:** let users pick light, dark or system theme ([d01d695](https://github.com/alex-bluetrain/mostro-app/commit/d01d695bc3cf8a08ebf8411f61635f94aa9218b9))
* **settings:** list themes as light, dark, system ([e8fbcf9](https://github.com/alex-bluetrain/mostro-app/commit/e8fbcf92c976f140133dd478b228ebe423917123))
* **settings:** sync language and theme with the server ([a84d65b](https://github.com/alex-bluetrain/mostro-app/commit/a84d65b55d11be0775e2286e98396c217d1757e0))
* **web:** load chat history on open, drop new-chat and thread list ([73775a5](https://github.com/alex-bluetrain/mostro-app/commit/73775a540da9928e01b6fc372044eb77a27619fe))
* **web:** replace the chat sidebar with a settings menu ([85052c3](https://github.com/alex-bluetrain/mostro-app/commit/85052c316c5a861394b69e0bbf11f8881c9fce08))
* **web:** show only the messages the model reads ([0acda30](https://github.com/alex-bluetrain/mostro-app/commit/0acda30c01d6183d12eae1e96c2e9aaccbcdff0e))


### Bug Fixes

* **settings:** label notifications toggle without naming the channel ([605fb9f](https://github.com/alex-bluetrain/mostro-app/commit/605fb9f7a1f4916cf34031a74bf6dd167240a166))
* **ui:** use Material/SF symbols for menu and close icons ([6b584b0](https://github.com/alex-bluetrain/mostro-app/commit/6b584b0f71e9a3390657bc15941b43f2627b5dbd))

## [1.3.0](https://github.com/alex-bluetrain/mostro-app/compare/mostro-app-v1.2.0...mostro-app-v1.3.0) (2026-09-27)


### Features

* **web:** apply amber brand accent to the web chat ([6f9b521](https://github.com/alex-bluetrain/mostro-app/commit/6f9b5210629e23d26e5e64829bd70635ffad9034))
* **web:** keep the login across reloads with a server session cookie ([61aa96f](https://github.com/alex-bluetrain/mostro-app/commit/61aa96f162c51fd39390c0a55764cf0527ea16b1))

## [1.2.0](https://github.com/alex-bluetrain/mostro-app/compare/mostro-app-v1.1.0...mostro-app-v1.2.0) (2026-09-23)


### Features

* Render chat with official OpenUI web library via Expo DOM component ([#3](https://github.com/alex-bluetrain/mostro-app/issues/3)) ([e519644](https://github.com/alex-bluetrain/mostro-app/commit/e519644b50600f234f7f75d5f181388c276c6309))


### Bug Fixes

* **native:** render assistant messages instead of blanking the app ([0f16554](https://github.com/alex-bluetrain/mostro-app/commit/0f1655411b8a2ce9a468b1c983fedbbb06b376a7))

## [1.1.0](https://github.com/alex-bluetrain/mostro-app/compare/mostro-app-v1.0.0...mostro-app-v1.1.0) (2026-09-21)


### Features

* **deploy:** runtime config + Cloudflare Pages CI ([1492211](https://github.com/alex-bluetrain/mostro-app/commit/1492211bee32018952dae032f03a64ce3d4a5589))
* dev API-key login and resilient auth error handling ([301c15b](https://github.com/alex-bluetrain/mostro-app/commit/301c15b6a3de467deb36c4fc40710233e9f8de67))
* Google auth (GIS web + expo-auth-session native) ([9308e79](https://github.com/alex-bluetrain/mostro-app/commit/9308e79e730efa7e9855064b74a97f3e30c21dd0))
* i18n with EN/ES language selector and persistence ([9f0452f](https://github.com/alex-bluetrain/mostro-app/commit/9f0452f8bb4adda57cf6e4fe6cd74d4942b94347))
* migrate Android auth to [@react-native-google-signin](https://github.com/react-native-google-signin) ([0a0e1bc](https://github.com/alex-bluetrain/mostro-app/commit/0a0e1bc4f5689bbabe9792f426c75907f79f1a53))
* native chat UI streaming OpenUI-Lang from mostro-supervisor ([bcb5a40](https://github.com/alex-bluetrain/mostro-app/commit/bcb5a4057201216aea038a3aa86a5458c8f46b73))
* **web:** load Inter on web only for a predictable render ([e59f4ba](https://github.com/alex-bluetrain/mostro-app/commit/e59f4baadb11d4b185847f37d53cd174f06aa2b8))


### Bug Fixes

* **deploy:** move add-mask out of GITHUB_ENV block ([53d4559](https://github.com/alex-bluetrain/mostro-app/commit/53d4559aa953071a6122002ef6bddc4877805fa2))
* **ui:** close four design-system gaps found while documenting it ([9cea9db](https://github.com/alex-bluetrain/mostro-app/commit/9cea9db62667b48f2b5be062f92a1b19334073dc))
* **web:** single hydration-safe source for the color scheme ([32cdc50](https://github.com/alex-bluetrain/mostro-app/commit/32cdc506827f264ec909147ab3b579638c10524c))
