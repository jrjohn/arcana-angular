# Changelog

## [1.3.1](https://github.com/jrjohn/arcana-angular/compare/v1.3.0...v1.3.1) (2026-06-15)


### Bug Fixes

* **deps:** update dependency uuid to v14 ([#34](https://github.com/jrjohn/arcana-angular/issues/34)) ([0f7f698](https://github.com/jrjohn/arcana-angular/commit/0f7f6988ac60bbd654ee8764f40cfcc191764c61))

## [1.3.0](https://github.com/jrjohn/arcana-angular/compare/v1.2.0...v1.3.0) (2026-06-15)


### Features

* **deps:** upgrade Angular 21→22 + TypeScript 6 ([#29](https://github.com/jrjohn/arcana-angular/issues/29)) ([fe089ff](https://github.com/jrjohn/arcana-angular/commit/fe089ffc9591af4e82f1c3ed2dd433fb0bfc6fea))

## [1.2.0](https://github.com/jrjohn/arcana-angular/compare/v1.1.0...v1.2.0) (2026-06-12)


### Features

* add DAO layer following arcana-cloud-springboot pattern ([13d9861](https://github.com/jrjohn/arcana-angular/commit/13d986113efe1d6193814c1f2e6c1035d39818cc))
* add DAO layer to complete Service→Repository→DAO architecture ([aa06564](https://github.com/jrjohn/arcana-angular/commit/aa06564e12640bee4a48a301304aa5af7455dbae))
* add spec for MainLayoutComponent (12 lines) + RightPanelComponent (7 lines) ([201ef7d](https://github.com/jrjohn/arcana-angular/commit/201ef7d8d23a4f2313701e19eab20104c324c1a3))


### Bug Fixes

* add CACHEBUST ARG to Dockerfile.test to prevent stale Docker cache ([c6a77b9](https://github.com/jrjohn/arcana-angular/commit/c6a77b9b0176affa9b69a85d4863c53e90da4255))
* add karma.conf.js to generate lcov.info for SonarQube coverage ([ea9225d](https://github.com/jrjohn/arcana-angular/commit/ea9225dc795652170debd09a77fd2c00e77951df))
* **arch:** remove Domain→Data layer violation in EventTrackingService ([1eaf0ca](https://github.com/jrjohn/arcana-angular/commit/1eaf0cac10b0878549f65deacb66aa5bfb4f5ffb))
* correct 2 failing CacheService tests ([88dfc56](https://github.com/jrjohn/arcana-angular/commit/88dfc566bea5c87b842d5c2911da28a873574c95))
* correct karma-coverage patch target (config.reporters not coverageReporter.reporters) ([aa5b1d7](https://github.com/jrjohn/arcana-angular/commit/aa5b1d77de036cf9488028ee64206916ecd201be))
* correct NOSONAR approach for Angular HTML templates ([5f211fe](https://github.com/jrjohn/arcana-angular/commit/5f211fe9cbb38cb4db4879b1bf835b58bff95a7e))
* correct sonar lcov path to coverage/arcana-angular/lcov.info ([6819616](https://github.com/jrjohn/arcana-angular/commit/68196162371223288582e1faeb1327f171a4f8ae))
* correct TS types in offline-sync + user-panel specs ([0586039](https://github.com/jrjohn/arcana-angular/commit/058603942a1f62c79776170c46d733d2157f25db))
* correct user.dto import path in user.dao.ts ([fa6e6d8](https://github.com/jrjohn/arcana-angular/commit/fa6e6d8fbd10e636c2faa4be0befc27e95070ec2))
* **deps:** update angular monorepo ([#5](https://github.com/jrjohn/arcana-angular/issues/5)) ([14ac57b](https://github.com/jrjohn/arcana-angular/commit/14ac57b1654b1a99031fe4c0155e750d5bd38355))
* **deps:** update angular monorepo ([#9](https://github.com/jrjohn/arcana-angular/issues/9)) ([775d099](https://github.com/jrjohn/arcana-angular/commit/775d0994544cb1bb36b4c1bbe702cfe7915e955e))
* full karma.conf.js with Angular plugins + lcov reporter ([1ce4eec](https://github.com/jrjohn/arcana-angular/commit/1ce4eec55ae9da1c7678249fc3e8da355cb7300e))
* improve code quality and security - reduce SonarQube issues ([6a1778c](https://github.com/jrjohn/arcana-angular/commit/6a1778c146cb83a9ece3136497a33184081353a3))
* MainLayout spec use overrideComponent to stub child deps, fix isOffline getter mock ([ea9563d](https://github.com/jrjohn/arcana-angular/commit/ea9563d2d4084163b666bf8c8363f13f18201e4f))
* move karma-coverage patch to coverage-patch.js (avoid YAML quoting issues) ([b1f6794](https://github.com/jrjohn/arcana-angular/commit/b1f679456a5090103c381a638ca872cb4121de35))
* patch karma-coverage at runtime to inject lcovonly reporter ([659c72a](https://github.com/jrjohn/arcana-angular/commit/659c72a7987b97f54b3cb127a600d63dc0d3029e))
* remove custom karmaConfig; use Angular CLI default karma setup ([876dc64](https://github.com/jrjohn/arcana-angular/commit/876dc640084129bdac44d507063c86f7f05eca83))
* remove global event dispatching in network-monitor spec (prevents test pollution) ([1206671](https://github.com/jrjohn/arcana-angular/commit/12066716d7c304b8b47987a83742d266bae7db63))
* remove implements OnInit from SidebarComponent (TS2420) ([04b7482](https://github.com/jrjohn/arcana-angular/commit/04b7482351894c202d3a1ba39452ade4f395e206))
* remove invalid angular.json schema options; pass browsers via CLI ([1ea0be5](https://github.com/jrjohn/arcana-angular/commit/1ea0be559ca51362c010a98cbf3fb03b70f6a345))
* remove ngOnInit tests from SidebarComponent spec (method was removed) ([ce8ca8d](https://github.com/jrjohn/arcana-angular/commit/ce8ca8d7151316e7ccf539e754bde46f0379aef2))
* resolve 147 SonarQube issues across Angular app ([2b52469](https://github.com/jrjohn/arcana-angular/commit/2b52469619f7548fae4c7f3aea69aefbba7d40ee))
* resolve 24 failing tests + add offline-sync spec ([2b3453d](https://github.com/jrjohn/arcana-angular/commit/2b3453dc60495560238d94969ca02fa75c2ce506))
* resolve 48 remaining SonarQube issues in Angular app ([5b22f3f](https://github.com/jrjohn/arcana-angular/commit/5b22f3fa356f97b43fa15c1a28dbc6dd565fbd76))
* resolve final 20 SonarQube issues in Angular app ([50d5314](https://github.com/jrjohn/arcana-angular/commit/50d5314db8307506b46f0b69a29fc28edaa0d875))
* resolve NetworkMonitorService test temporal dead zone error ([7f3287c](https://github.com/jrjohn/arcana-angular/commit/7f3287c0f6a5d0dc7ab96dc766def1b9bb3c5e1f))
* resolve SonarQube issues - css:S4667, css:S4666, Web:TableWithoutCaptionCheck ([4bb9ed5](https://github.com/jrjohn/arcana-angular/commit/4bb9ed5c68672368c975775364c8acdd0ca49d00))
* resolve TS type errors in spec files (null→undefined, void→string, number→Date) ([3bec437](https://github.com/jrjohn/arcana-angular/commit/3bec437ff8a679397e0d392c358429e07b4eb6e6))
* simplify karma.conf.js for Angular CLI compatibility ([10a661d](https://github.com/jrjohn/arcana-angular/commit/10a661d9e8090052c10c5706f35262ab5dc040f7))
* strip karma.conf.js to bare minimum - only custom launcher ([bd01dba](https://github.com/jrjohn/arcana-angular/commit/bd01dbacd223072f96d6a711a146b6be1aa7afee))
* use chromium-nosandbox wrapper - enables ChromeHeadless as root without --no-sandbox ([8ab114a](https://github.com/jrjohn/arcana-angular/commit/8ab114af2ca7ee48d5c9bb0c910db0bb754e567f))


### Reverts

* remove karmaConfig and karma.conf.js (Angular 20 incompatible) ([0ec22c9](https://github.com/jrjohn/arcana-angular/commit/0ec22c940fda63442a0c9fcc9da0dc5088b31605))

## [1.1.0](https://github.com/jrjohn/arcana-angular/compare/arcana-angular-v1.0.0...arcana-angular-v1.1.0) (2026-06-11)


### Features

* add DAO layer following arcana-cloud-springboot pattern ([13d9861](https://github.com/jrjohn/arcana-angular/commit/13d986113efe1d6193814c1f2e6c1035d39818cc))
* add DAO layer to complete Service→Repository→DAO architecture ([aa06564](https://github.com/jrjohn/arcana-angular/commit/aa06564e12640bee4a48a301304aa5af7455dbae))
* add spec for MainLayoutComponent (12 lines) + RightPanelComponent (7 lines) ([201ef7d](https://github.com/jrjohn/arcana-angular/commit/201ef7d8d23a4f2313701e19eab20104c324c1a3))


### Bug Fixes

* add CACHEBUST ARG to Dockerfile.test to prevent stale Docker cache ([c6a77b9](https://github.com/jrjohn/arcana-angular/commit/c6a77b9b0176affa9b69a85d4863c53e90da4255))
* add karma.conf.js to generate lcov.info for SonarQube coverage ([ea9225d](https://github.com/jrjohn/arcana-angular/commit/ea9225dc795652170debd09a77fd2c00e77951df))
* **arch:** remove Domain→Data layer violation in EventTrackingService ([1eaf0ca](https://github.com/jrjohn/arcana-angular/commit/1eaf0cac10b0878549f65deacb66aa5bfb4f5ffb))
* correct 2 failing CacheService tests ([88dfc56](https://github.com/jrjohn/arcana-angular/commit/88dfc566bea5c87b842d5c2911da28a873574c95))
* correct karma-coverage patch target (config.reporters not coverageReporter.reporters) ([aa5b1d7](https://github.com/jrjohn/arcana-angular/commit/aa5b1d77de036cf9488028ee64206916ecd201be))
* correct NOSONAR approach for Angular HTML templates ([5f211fe](https://github.com/jrjohn/arcana-angular/commit/5f211fe9cbb38cb4db4879b1bf835b58bff95a7e))
* correct sonar lcov path to coverage/arcana-angular/lcov.info ([6819616](https://github.com/jrjohn/arcana-angular/commit/68196162371223288582e1faeb1327f171a4f8ae))
* correct TS types in offline-sync + user-panel specs ([0586039](https://github.com/jrjohn/arcana-angular/commit/058603942a1f62c79776170c46d733d2157f25db))
* correct user.dto import path in user.dao.ts ([fa6e6d8](https://github.com/jrjohn/arcana-angular/commit/fa6e6d8fbd10e636c2faa4be0befc27e95070ec2))
* **deps:** update angular monorepo ([#5](https://github.com/jrjohn/arcana-angular/issues/5)) ([14ac57b](https://github.com/jrjohn/arcana-angular/commit/14ac57b1654b1a99031fe4c0155e750d5bd38355))
* **deps:** update angular monorepo ([#9](https://github.com/jrjohn/arcana-angular/issues/9)) ([775d099](https://github.com/jrjohn/arcana-angular/commit/775d0994544cb1bb36b4c1bbe702cfe7915e955e))
* full karma.conf.js with Angular plugins + lcov reporter ([1ce4eec](https://github.com/jrjohn/arcana-angular/commit/1ce4eec55ae9da1c7678249fc3e8da355cb7300e))
* improve code quality and security - reduce SonarQube issues ([6a1778c](https://github.com/jrjohn/arcana-angular/commit/6a1778c146cb83a9ece3136497a33184081353a3))
* MainLayout spec use overrideComponent to stub child deps, fix isOffline getter mock ([ea9563d](https://github.com/jrjohn/arcana-angular/commit/ea9563d2d4084163b666bf8c8363f13f18201e4f))
* move karma-coverage patch to coverage-patch.js (avoid YAML quoting issues) ([b1f6794](https://github.com/jrjohn/arcana-angular/commit/b1f679456a5090103c381a638ca872cb4121de35))
* patch karma-coverage at runtime to inject lcovonly reporter ([659c72a](https://github.com/jrjohn/arcana-angular/commit/659c72a7987b97f54b3cb127a600d63dc0d3029e))
* remove custom karmaConfig; use Angular CLI default karma setup ([876dc64](https://github.com/jrjohn/arcana-angular/commit/876dc640084129bdac44d507063c86f7f05eca83))
* remove global event dispatching in network-monitor spec (prevents test pollution) ([1206671](https://github.com/jrjohn/arcana-angular/commit/12066716d7c304b8b47987a83742d266bae7db63))
* remove implements OnInit from SidebarComponent (TS2420) ([04b7482](https://github.com/jrjohn/arcana-angular/commit/04b7482351894c202d3a1ba39452ade4f395e206))
* remove invalid angular.json schema options; pass browsers via CLI ([1ea0be5](https://github.com/jrjohn/arcana-angular/commit/1ea0be559ca51362c010a98cbf3fb03b70f6a345))
* remove ngOnInit tests from SidebarComponent spec (method was removed) ([ce8ca8d](https://github.com/jrjohn/arcana-angular/commit/ce8ca8d7151316e7ccf539e754bde46f0379aef2))
* resolve 147 SonarQube issues across Angular app ([2b52469](https://github.com/jrjohn/arcana-angular/commit/2b52469619f7548fae4c7f3aea69aefbba7d40ee))
* resolve 24 failing tests + add offline-sync spec ([2b3453d](https://github.com/jrjohn/arcana-angular/commit/2b3453dc60495560238d94969ca02fa75c2ce506))
* resolve 48 remaining SonarQube issues in Angular app ([5b22f3f](https://github.com/jrjohn/arcana-angular/commit/5b22f3fa356f97b43fa15c1a28dbc6dd565fbd76))
* resolve final 20 SonarQube issues in Angular app ([50d5314](https://github.com/jrjohn/arcana-angular/commit/50d5314db8307506b46f0b69a29fc28edaa0d875))
* resolve NetworkMonitorService test temporal dead zone error ([7f3287c](https://github.com/jrjohn/arcana-angular/commit/7f3287c0f6a5d0dc7ab96dc766def1b9bb3c5e1f))
* resolve SonarQube issues - css:S4667, css:S4666, Web:TableWithoutCaptionCheck ([4bb9ed5](https://github.com/jrjohn/arcana-angular/commit/4bb9ed5c68672368c975775364c8acdd0ca49d00))
* resolve TS type errors in spec files (null→undefined, void→string, number→Date) ([3bec437](https://github.com/jrjohn/arcana-angular/commit/3bec437ff8a679397e0d392c358429e07b4eb6e6))
* simplify karma.conf.js for Angular CLI compatibility ([10a661d](https://github.com/jrjohn/arcana-angular/commit/10a661d9e8090052c10c5706f35262ab5dc040f7))
* strip karma.conf.js to bare minimum - only custom launcher ([bd01dba](https://github.com/jrjohn/arcana-angular/commit/bd01dbacd223072f96d6a711a146b6be1aa7afee))
* use chromium-nosandbox wrapper - enables ChromeHeadless as root without --no-sandbox ([8ab114a](https://github.com/jrjohn/arcana-angular/commit/8ab114af2ca7ee48d5c9bb0c910db0bb754e567f))


### Reverts

* remove karmaConfig and karma.conf.js (Angular 20 incompatible) ([0ec22c9](https://github.com/jrjohn/arcana-angular/commit/0ec22c940fda63442a0c9fcc9da0dc5088b31605))
