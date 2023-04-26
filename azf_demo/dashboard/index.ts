import { AzureFunction, Context, HttpRequest } from "@azure/functions"

type Entry = {
    id: string;
    imageUrl: string;
    isDog: boolean;
    description: string;
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, entries: Entry[]): Promise<void> {
    context.res = {
        headers: {
            'Content-Type': 'application/json',
        },
        body: entries
    };

};

export default httpTrigger;
