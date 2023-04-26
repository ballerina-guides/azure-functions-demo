The repository contains the code for a dog review web application. The backend of the application is written by Ballerina Azure functions. The webapp is created by ReactJS and Tailwind CSS. The objective of the demo is to demonstrate a practical use case written Ballerina Azure functions.

### Supported Triggers and Bindings

The sample covers following azure functions triggers and bindings. The goal is to make use of all the supported triggers and bindings into this sample.

- Triggers - HTTP, Blob
- Input Bindings - CosmosDB
- Output Bindings - Blob, HTTP, CosmosDB


### Other Implementations
- [main](https://github.com/ballerina-guides/azure-functions-demo) - Ballerina
- [node-v3](https://github.com/ballerina-guides/azure-functions-demo/tree/node-v3) - Stable NodeJS azure functions implementation
- [node-v4](https://github.com/ballerina-guides/azure-functions-demo/tree/node-v4) - Experimental NodeJS programming model of azure functions

### Prerequisites

- [Ballerina - 2201.5.x +](https://ballerina.io/downloads/)

- [Docker](https://docs.docker.com/get-docker/) (Required for Native build)

- [Azure Functions core tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)

- [Azure Account with a subscription](https://portal.azure.com/#home)

- [Visual studio code](https://code.visualstudio.com/download) (Optional)

- [Ballerina Vscode Plugin](https://marketplace.visualstudio.com/items?itemName=WSO2.ballerina) (Optional)

- [Azure Functions Vscode Plugin](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) (Optional)

- [NodeJS - v16.15.0 +](https://nodejs.org/en/download/) (Required for running the frontend)


### Environment Creation

1\. [Function App with Storage Account](https://portal.azure.com/#create/Microsoft.FunctionApp)

- Publish — Code

- Runtime Stack — Java

- Version — Java 11

- Operating System — Windows

- In the Review & Create screen, make note of the storage account name.

2\. [Storage Account](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Storage%2FStorageAccounts)

- Go to the created Storage account -\> Containers -\> New Container

- Name — images

- Public access level — Blob

3\. [Azure Cosmos DB for NoSQL](https://portal.azure.com/#create/Microsoft.DocumentDB)

- Go to Data Explorer -\> Create New Container

- Create a new database id — reviewdb

- Container id — c1

- Container throughput — Manual — RU/s — 400 (To stay within the free tier)

4\.[ Azure Computer Vision](https://portal.azure.com/#create/Microsoft.CognitiveServicesComputerVision)

- Go to the account created and click on `Keys and Endpoint`, then note down the values of `Key 1`.


### Building and Deployment

Ballerina generates all the required artifacts required for deploying in Azure functions. All you have to do is to execute `bal build` in the ballerina package directory and execute publish command shown in the build output to deploy the function app.

```bash
cd <repo_dir>/azf_demo
bal build
func azure functionapp publish <function_app_name> --script-root target/azure_functions
```

![](https://cdn-images-1.medium.com/max/800/1\*XYgB6PvdJW4VuE16mItY6A.png)

### Configurations
Once the deployment is done, we need to update the application settings to set the values to configurables and the CosmosDB Connection String.

![](https://cdn-images-1.medium.com/max/800/1\*L3ACGuToGjdTQoIingcaFA.gif)

#### Cosmos DB
```
Name — CosmosDBConnection
Value —  <<Value received from Cosmos DB Keys in step 3>>
```

#### Blob Storage
If you created the Blob Storage along with the function app, the application setting should already be applied. Therefore, there's no need to configure it again.

#### Ballerina Configurables
You can set environment variables from the Application settings as well. In ballerina, Configurable values need to be passed from the Config.toml. We can use the BAL_CONFIG_DATA environment variable to pass Config.toml contents.

We have three configurable values. You can get the values for these from the values obtained during the environment creation step.

1. visionApp - Azure Computer Vision App created in step 4 of the environment creation.

2. subscriptionKey - Subscription key taken from the step 4 Key 1 field.

3. storeAccountName - Name of the storage account created alongside the function app in step 1.

You can find a sample application config entry below. You need to replace the existing values with the actual values from the environment you've created as explained above.

```
Name - BAL_CONFIG_DATA
Value - visionApp= "bal-review-vision1" \n subscriptionKey = "9abdcbxxxx" \n storeAccountName = "balreviewappstore"
```

Now the functions are all ready. You can invoke these functions manually, but to simplify the process, I’ve created a web app that makes use of these functions we just deployed. This web app simply calls the dashboard function to retrieve entries from the database and displays each entry. In addition, it also calls the upload function whenever an image is uploaded by the user. The code can be found under `web_app` directory. You need to replace the value of the `functionApp` variable in `App.js` with the function app you created in the prerequisites. Finally, you need to go to the function app in the azure portal and add cors settings, so that your front end can communicate properly.

![](https://cdn-images-1.medium.com/max/800/1\*xjN-jLQFuwaCmKmbWS2EHw.png)

----------

Next, you can simply start the function by executing `npm start` in the `web_app` directory.

```bash
cd <repo_dir>/web_app
npm install
npm start
```

Now you should be able to upload photos and view the photos and descriptions generated by the azure platform for the uploaded photos.

![](https://cdn-images-1.medium.com/max/800/1\*c04CYathRZcWtLhmvmTAmg.png)


### Native Compilation
Ballerina has experimental support for AOT compilation using GraalVM to generate standalone executables. This will greatly improve the startup time which will help to reduce the cold starts of azure functions. You can use this feature by providing `native` build option when building the ballerina package `bal build --native`. The native compilation process can take several minutes. Please note that you need to have a function app with Linux operating system to deploy the natively compiled functions. Rest of the instructions will be the same.
