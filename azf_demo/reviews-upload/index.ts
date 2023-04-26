import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import parseMultipartFormData from "@anzp/azure-function-multipart";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const subscriptionKey = process.env.subscriptionKey;
    const visionApp = process.env.storeAccountName;
    const storeAccountName = process.env.storeAccountName;

    const { files } = await parseMultipartFormData(req);
    let data = files[0].bufferFile;

    const endpoint = 'https://' + visionApp + '.cognitiveservices.azure.com/vision/v3.2/analyze?visualFeatures=Categories,Description';

    const options = {
        method: 'POST',
        url: endpoint,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': subscriptionKey
        },
        data: data
    };


    axios(options)
        .then(response => {
            const data1 = response.data;
            const tags: string[] = data1.description.tags;
            const isDog = tags.some((tag) => tag.includes("dog"));
            let desc = "";
            if (isDog) {
                let captions = data1.description.captions;
                if (captions > 0) {
                    desc = captions[0].text;
                }
            }
            context.bindings.outResp = Buffer.from(data).toString('base64')
            context.bindings.outResp1 = {
                "id": uuidv4(),
                "imageUrl": "https://" + storeAccountName + ".blob.core.windows.net/images/" + req.query.name,
                "isDog": isDog,
                "description": desc
            }
        })
        .catch(error => {
            console.log("Error occured " + error)
        });
};

export default httpTrigger;
