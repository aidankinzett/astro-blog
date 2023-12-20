---
title: "Sumsub Expo Config Plugin"
description: "How to install the Sumsub SDK into an Expo application using an Expo config plugin."
draft: true
pubDate: "Dec 20 2023"
toc: true
---

# Expo Config Plugins

Expo is good and helps us move quickly. Sometimes we need to add a package which isn't supported by Expo. This wasn't possible without ejecting until Expo introduced [Expo config plugins](https://docs.expo.dev/guides/config-plugins/).

Expo config plugins let you perform all the required steps to install a react native package. You can read more about them here. There is also a [GitHub repo](https://github.com/expo/config-plugins) with a collection of config plugins which can provide inspiration for creating new ones.

This blog post will detail how to create an Expo config plugin for the [Sumsub React Native SDK](https://developers.sumsub.com/msdk/plugins/react-native.html). 