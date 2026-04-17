import * as client from 'prom-client';
import { Injectable } from '@nestjs/common';
import {
    databaseResponseTimeHistogram,
    restResponseTimeHistogram,
    totalRequestConter,
    httpRequestSizeBytes,
    httpResponseSizeBytes,
    totalSocketCounter,
    totalMessagesConter
} from './prometheus-chatapp.exporters';


@Injectable()
export class PrometheusChatappService {
    private readonly client: client.Registry;

    constructor() {
        this.client = new client.Registry();
        this.client.registerMetric(totalMessagesConter),
        this.client.registerMetric(totalSocketCounter),
        this.client.registerMetric(totalRequestConter);
        this.client.registerMetric(httpRequestSizeBytes);
        this.client.registerMetric(httpResponseSizeBytes);
        this.client.registerMetric(restResponseTimeHistogram);
        this.client.registerMetric(databaseResponseTimeHistogram);

        this.client.setDefaultLabels({ app: 'chat_sky_track_app' });
        client.collectDefaultMetrics({
            register: this.client,
        });
    }

    async getMetrics(): Promise<string> {
        return await this.client.metrics();
    }
}
