import { Redis } from 'ioredis';

export class Helper {
    static async filterTypeMessages(msgType: string) {
        
    }
}

export class RedisPreCommnads {
    static async addObjectIntoStream() {
        // XADD with argument transformer to accept an object...
        Redis.Command.setArgumentTransformer('xadd', function (args) {
            // TODO two of then because is being sent user name and message
            if (args.length === 3) {
                const argArray: any = [];

                argArray.push(args[0], args[1]); // Key Name & ID.

                // Transform object into array of field name then value.
                const fieldNameValuePairs = args[2];

                for (const fieldName in fieldNameValuePairs) {
                    argArray.push(fieldName, fieldNameValuePairs[fieldName]);
                }

                return argArray;
            }

            return args;
        });
    }

    static async transformObject() {
        // Streams with reply transformer to get an array of objects...
        Redis.Command.setReplyTransformer('xrange', function (result) {
            if (Array.isArray(result)) {
                const newResult: any = [];
                for (const r of result) {
                    const obj = {
                        id: r[0],
                    };

                    const fieldNamesValues = r[1];

                    for (let n = 0; n < fieldNamesValues.length; n += 2) {
                        const k = fieldNamesValues[n];
                        const v = fieldNamesValues[n + 1];
                        obj[k] = v;
                    }

                    newResult.push(obj);
                }

                return newResult;
            }

            return result;
        });
    }
}