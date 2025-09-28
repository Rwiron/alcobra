import { createApp } from '../src/app';

export default async function handler(req: any, res: any) {
    const app = await createApp();
    // @ts-ignore - require on demand to avoid ESM interop issues
    const serverless = require('serverless-http');
    const handle = serverless(app);
    return handle(req, res);
}


