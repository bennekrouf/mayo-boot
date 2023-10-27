# mayo-boot

A simple CLI tool to seamlessly start your React Native app with different environment configurations. It will handle your environment settings and decide whether to run the app on iOS or Android based on your operating system or the platform argument provided.

## Installation

You can run it directly using npx:

```bash
npx mayo-boot [environmentName] [platform]
```

## Requirements

This tool assumes you're using __react-native-config__ in your React Native project. If not, install it first:

```bash
yarn add @react-native-community/cli
```

Ensure you have followed the setup guide of react-native-config for iOS and Android.



## Setting Up Environment Configuration

To use different environments, you should structure your configuration files in the following naming convention:

```bash
.env.{environmentName}
```

For example:

    __.env.local__
    __.env.staging__
    __.env.production__

Inside each file, define your environment-specific variables:

```bash
API_URL=https://api.local.example.com
ANOTHER_CONFIG=SomeValue
```

## Usage

Navigate to your React Native project directory and run:

```bash
mayo-boot [environmentName] [platform]
```


### For example:

To start the local environment for the default platform based on OS:

```bash
mayo-boot
```

To specify both an environment and a platform:

```bash
mayo-boot staging android
```

The command above will utilize the .env.local file for environment configurations and then launch the appropriate version of the app on the specified platform (iOS or Android).

## Note

The tool will, by default, use the .env.local configuration if no environment name is provided. Ensure that you have, at the very least, a .env.local file in your project.


## Issues & Contributions

If you encounter any issues or would like to contribute to this tool, please open an issue or a pull request.