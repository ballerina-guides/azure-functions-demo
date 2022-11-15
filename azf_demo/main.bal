// Copyright (c) 2022 WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import ballerinax/azure_functions as af;
import ballerina/http;
import ballerina/uuid;

configurable string visionApp = ?;
configurable string subscriptionKey = ?;
configurable string storeAccountName = ?;

service /reviews on new af:HttpListener() {
    resource function post upload(@http:Payload byte[] image, string name) returns [@af:BlobOutput {path: "images/{Query.name}"} byte[], @af:CosmosDBOutput {
        connectionStringSetting: "CosmosDBConnection",
        databaseName: "reviewdb",
        collectionName: "c1"
    } Entry]|error {

        var [isDog, description] = check getImageInsights(image);

        return [
            image,
            {
                id: uuid:createType1AsString(),
                imageUrl: "https://" + storeAccountName + ".blob.core.windows.net/images/" + name,
                isDog: isDog,
                description: description
            }
        ];
    }
}

function getImageInsights(byte[] image) returns [boolean, string]|error {
    final http:Client clientEndpoint = check new ("https://" + visionApp + ".cognitiveservices.azure.com/vision/v3.2/analyze", {
        timeout: 10,
        httpVersion: http:HTTP_1_1
    });

    http:Request req = new ();
    req.setBinaryPayload(image);
    req.addHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
    ImageAnalyzeResponse resp = check clientEndpoint->post("/?visualFeatures=Categories,Description", req);

    string[] dogs = from string tag in resp.description.tags
        where tag.includes("dog")
        select tag;

    if (dogs.length() > 0) {
        Caption[] captions = resp.description.captions;
        string description = "";
        if (captions.length() > 0) {
            Caption caption = captions[0];
            description = caption.text;
        }
        return [true, description];
    }
    return [false, ""];
}

service /dashboard on new af:HttpListener() {
    resource function get .(@af:CosmosDBInput {
                connectionStringSetting: "CosmosDBConnection",
                databaseName: "reviewdb",
                collectionName: "c1",
                sqlQuery: "SELECT * FROM Items"
            } Entry[] entries) returns @af:HttpOutput Entry[]|error {
        return entries;
    }
}
