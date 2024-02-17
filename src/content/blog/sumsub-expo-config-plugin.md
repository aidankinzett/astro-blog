---
title: "How to create an Expo Config Plugin"
description: "Use an Expo Config Plugin to add support for SumSub to an Expo project"
pubDate: "Feb 16 2024"
draft: true
toc: true
---

# Expo Config Plugins

A config plugin can be used to automatically configure your Expo project to support a native module. They can be used to add native modules or add any native code that needs to be configured. [^1] Some modules already include a config plugin, this guide is for creating a custom config plugin for modules without one. This guide assumes that you are working in a monorepo and are relatively comfortable with the Expo build process.

# Example - SumSub

This guide will use SumSub's React Native module as an example. You can substitute this for any other module that you want to install.

## React Native Installation Instructions

We need to use the instructions for installing your package into a standard React Native app to set up the config plugin. For SumSub, the instructions can be found [here](https://developers.sumsub.com/msdk/plugins/react-native.html#latest-release).

## Create Config Plugin

To start we will create a new workspace in our monorepo for the config plugin.



<!-- TODO: how to create a config plugin in a monorepo -->

## Add Android Support

First we need to look at the instructions provided to us by SumSub:

> Add the following repository to your `android/build.gradle` file:
> ```gradle
> allprojects {
>  repositories {
>      // ...
>      maven { url "https://maven.sumsub.com/repository/maven-public/" }
>      // ...
>  }
>}
>```
>
> To enable VideoIdent support, uncomment the following line in `node_modules/@sumsub/react-native-mobilesdk-module/android/build.gradle`
> ```gradle
> dependencies {
>  ...
>    implementation "com.sumsub.sns:idensic-mobile-sdk-videoident:1.29.0"
>  ...
> }
> ```

The first step here is to add an extra maven repo to the `build.gradle` file. This can be done without using our custom config plugin by using Expo's [`expo-build-properties` plugin](https://docs.expo.dev/versions/latest/sdk/build-properties/). This plugin configures the native build properties during the prebuild phase. Add the following to your app's `app.config.js`:

```javascript
export default {
  expo: {
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            // required for sumsub sdk
            extraMavenRepos: [
              "https://maven.sumsub.com/repository/maven-public/",
            ],
          },
        },
      ],
  },
};
```

For my project adding this maven repo caused errors during the build process, to fix those errors I had to add a workaround to the custom config plugin. Add the following to the `withSumSubAndroid.ts` file:

```typescript
/**
 * @module withSumSubAndroid
 *
 * @description This function adds the native code required for SumSub's SDK.
 *
 * @see https://docs.expo.io/guides/config-plugins/
 */
import { ConfigPlugin, withAppBuildGradle } from "expo/config-plugins";

/**
 * Add config required for SumSub's SDK to the Android project.
 *
 * This fixes a dependency issue introduced by the SumSub SDK.
 * @see https://github.com/stripe/stripe-android/issues/3173#issuecomment-785176608
 */
const withSumSubProjectBuildGradle: ConfigPlugin = (config) => {
  return withAppBuildGradle(config, async (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /android {/m,
      (str) => `${str}\n        configurations.all {
        c -> c.resolutionStrategy.eachDependency {
            DependencyResolveDetails dependency ->
                println dependency.requested.group
                 if (dependency.requested.group == 'org.bouncycastle') {
                    dependency.useTarget 'org.bouncycastle:bcprov-jdk15to18:1.68'
                }
        }
    }`,
    );

    return config;
  });
};

/**
 * Adds the Android native code for the SumSub sdk to the Android project.
 */
const withAndroidSumSub: ConfigPlugin = (config) => {
  config = withSumSubProjectBuildGradle(config);

  return config;
};

export default withAndroidSumSub;
```

The second step is to uncomment a file in our project's `node_modules`. To achieve this in a way that will be persistent across installs I used yarn's `patch` feature. Run the following to get started:
```bash
yarn patch @sumsub/react-native-mobilesdk-module
➤ YN0000: Package @sumsub/react-native-mobilesdk-module@npm:1.28.0 got extracted with success!
➤ YN0000: You can now edit the following folder: /private/var/folders/bq/wf4mq11s4sgdv90bl9dqjtcm0000gn/T/xfs-1d84ad7c/user
➤ YN0000: Once you are done run yarn patch-commit -s /private/var/folders/bq/wf4mq11s4sgdv90bl9dqjtcm0000gn/T/xfs-1d84ad7c/user and Yarn will store a patchfile based on your changes.
➤ YN0000: Done in 0s 25ms
```
Open the folder that yarn has created for you and uncomment the specified line in `node_modules/@sumsub/react-native-mobilesdk-module/android/build.gradle`:
```
dependencies {
 ...
   implementation "com.sumsub.sns:idensic-mobile-sdk-videoident:1.29.0"
 ...
}
```
Next run the `yarn patch-commit` command which yarn gave in the previous step:
```bash
yarn patch-commit -s /private/var/folders/bq/wf4mq11s4sgdv90bl9dqjtcm0000gn/T/xfs-1d84ad7c/user
```
This will save the uncommented version of the file in a patch commit, which yarn will automatically install when running `yarn install`.

Next, run an Android build and make sure that everything works correctly so far.

## Add iOS Support

Again we will start with the instructions from SumSub:

> Ensure that bitcode is disabled for your iOS project
> 1. Add as follows at the top of `ios/Podfile`:
> ```rb
> source 'https://cdn.cocoapods.org/'
> source 'https://github.com/SumSubstance/Specs.git'
> 
> # Enable MRTDReader (NFC) module
> #ENV['IDENSIC_WITH_MRTDREADER'] = 'true'
> 
> # Enable VideoIdent module
> #ENV['IDENSIC_WITH_VIDEOIDENT'] = 'true'
> ```
>
> Then run:
> ```sh
> npx pod-install
> ```
> 2. Update `Info.plist` to have a description for the usage of the camera, the microphone, the photo library and the geolocation:
> ```sh
> plutil -insert "NSCameraUsageDescription" -string "Let us take a photo" ios/${PWD##*/}/Info.plist
> plutil -insert "NSMicrophoneUsageDescription" -string "Time to record a video" ios/${PWD##*/}/Info.plist
> plutil -insert "NSPhotoLibraryUsageDescription" -string "Let us pick a photo" ios/${PWD##*/}/Info.plist
> plutil -insert "NSLocationWhenInUseUsageDescription" -string "Please provide us with your geolocation data to prove your current > location" ios/${PWD##*/}/Info.plist
> ```

Step 1 is to add some lines to the top of the `Podfile`. This can be done using the `withDangerousMod` config plugin. Add the following to `withSumSubIOS.ts`:

```typescript
import { withDangerousMod } from "@expo/config-plugins";
import { ConfigPlugin } from "expo/config-plugins";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const withSumSubPod: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const { platformProjectRoot } = cfg.modRequest;
      const podfile = resolve(platformProjectRoot, "Podfile");
      const contents = readFileSync(podfile, "utf-8");
      const lines = contents.split("\n");

      writeFileSync(
        podfile,
        [
          `source 'https://cdn.cocoapods.org/'`,
          `source 'https://github.com/SumSubstance/Specs.git'`,
          // `ENV['IDENSIC_WITH_MRTDREADER'] = 'true'`,
          // `ENV['IDENSIC_WITH_VIDEOIDENT'] = 'true'`,
          ...lines,
        ].join("\n"),
      );

      return cfg;
    },
  ]);
};
```

Step 2 is to add to `Info.plist`, which can be done using the `withInfoPlist` config plugin. Update `withSumSubIOS.ts` to the following:

```ts
/**
 * @module withSumSubIOS
 *
 * @description This function adds the native code required for SumSub's SDK.
 *
 * @see https://docs.expo.io/guides/config-plugins/
 */

import { withDangerousMod, withPlugins } from "@expo/config-plugins";
import { ConfigPlugin, withInfoPlist } from "expo/config-plugins";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const withSumSubPod: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const { platformProjectRoot } = cfg.modRequest;
      const podfile = resolve(platformProjectRoot, "Podfile");
      const contents = readFileSync(podfile, "utf-8");
      const lines = contents.split("\n");

      writeFileSync(
        podfile,
        [
          `source 'https://cdn.cocoapods.org/'`,
          `source 'https://github.com/SumSubstance/Specs.git'`,
          // `ENV['IDENSIC_WITH_MRTDREADER'] = 'true'`,
          // `ENV['IDENSIC_WITH_VIDEOIDENT'] = 'true'`,
          ...lines,
        ].join("\n"),
      );

      return cfg;
    },
  ]);
};

/**
 * Add required fields to Info.plist and add background mode capability
 *
 * @link https://developers.sumsub.com/msdk/plugins/react-native.html#ios
 */
const withSumSubInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, (cfg) => {
    // update permission descriptions
    cfg.modResults.NSCameraUsageDescription = "Let us take a photo";
    cfg.modResults.NSMicrophoneUsageDescription = "Time to record a video";
    cfg.modResults.NSPhotoLibraryUsageDescription = "Let us pick a photo";
    cfg.modResults.NSLocationWhenInUseUsageDescription =
      "Please provide us with your geolocation data to prove your current location";
    return cfg;
  });
};

const withSumSub: ConfigPlugin = (config) => {
  return withPlugins(config, [withSumSubPod, withSumSubInfoPlist]);
};

export default withSumSub;
```

Sumsub have some extra instructions for enabling `VideoIdent`. In order to enable this we need to uncomment one of the lines from the prior step:
```ts
writeFileSync(
    podfile,
    [
        `source 'https://cdn.cocoapods.org/'`,
        `source 'https://github.com/SumSubstance/Specs.git'`,
        // `ENV['IDENSIC_WITH_MRTDREADER'] = 'true'`,
        `ENV['IDENSIC_WITH_VIDEOIDENT'] = 'true'`,
        ...lines,
    ].join("\n"),
    );
```
We also need to enable the background mode capability. This can be done by adding to our config plugin which edits the `Info.plist`:
```ts
/**
 * Add required fields to Info.plist and add background mode capability
 *
 * @link https://developers.sumsub.com/msdk/plugins/react-native.html#ios
 * @link https://developers.sumsub.com/msdk/plugins/react-native.html#videoident
 */
const withSumSubInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, (cfg) => {
    // add background mode capability
    cfg.modResults.UIBackgroundModes = ["audio"];

    // update permission descriptions
    cfg.modResults.NSCameraUsageDescription = "Let us take a photo";
    cfg.modResults.NSMicrophoneUsageDescription = "Time to record a video";
    cfg.modResults.NSPhotoLibraryUsageDescription = "Let us pick a photo";
    cfg.modResults.NSLocationWhenInUseUsageDescription =
      "Please provide us with your geolocation data to prove your current location";
    return cfg;
  });
};
```

The final `withSumSubIOS` should be as follows:

```ts
/**
 * @module withSumSubIOS
 *
 * @description This function adds the native code required for SumSub's SDK.
 *
 * @see https://docs.expo.io/guides/config-plugins/
 */

import { withDangerousMod, withPlugins } from "@expo/config-plugins";
import { ConfigPlugin, withInfoPlist } from "expo/config-plugins";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const withSumSubPod: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const { platformProjectRoot } = cfg.modRequest;
      const podfile = resolve(platformProjectRoot, "Podfile");
      const contents = readFileSync(podfile, "utf-8");
      const lines = contents.split("\n");

      writeFileSync(
        podfile,
        [
          `source 'https://cdn.cocoapods.org/'`,
          `source 'https://github.com/SumSubstance/Specs.git'`,
          // `ENV['IDENSIC_WITH_MRTDREADER'] = 'true'`,
          `ENV['IDENSIC_WITH_VIDEOIDENT'] = 'true'`,
          ...lines,
        ].join("\n"),
      );

      return cfg;
    },
  ]);
};

/**
 * Add required fields to Info.plist and add background mode capability
 *
 * @link https://developers.sumsub.com/msdk/plugins/react-native.html#ios
 * @link https://developers.sumsub.com/msdk/plugins/react-native.html#videoident
 */
const withSumSubInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, (cfg) => {
    // add background mode capability
    cfg.modResults.UIBackgroundModes = ["audio"];

    // update permission descriptions
    cfg.modResults.NSCameraUsageDescription = "Let us take a photo";
    cfg.modResults.NSMicrophoneUsageDescription = "Time to record a video";
    cfg.modResults.NSPhotoLibraryUsageDescription = "Let us pick a photo";
    cfg.modResults.NSLocationWhenInUseUsageDescription =
      "Please provide us with your geolocation data to prove your current location";
    return cfg;
  });
};

const withSumSub: ConfigPlugin = (config) => {
  return withPlugins(config, [withSumSubPod, withSumSubInfoPlist]);
};

export default withSumSub;
```


# Conclusion

This guide stepped through how to set up an Expo Config Plugin to support a module which does not support Expo. We have used SumSub's React Native module here but the process can be followed for other modules.

[^1]: https://docs.expo.dev/config-plugins/introduction/