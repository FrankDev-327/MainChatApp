import { Injectable } from '@nestjs/common';
import { LoggerPrint } from '../logger/logger.print';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ElascitServiceService {
    constructor(private elasticsearchService: ElasticsearchService,
        private logger: LoggerPrint
    ) { }

    async indexUser(index: string, body) {
        try {
            await this.elasticsearchService.index({
                index: index,
                body: JSON.parse(JSON.stringify(body)),
            });
        } catch (error) {
            this.logger.error(`Error indexing user: ${(error as Error).message}`);
        }
    }

    async ensureIndex(index: string): Promise<void> {
        const exists = await this.elasticsearchService.indices.exists({ index });
        if (!exists) {
            await this.elasticsearchService.indices.create({
                index,
                mappings: {
                    properties: {
                        id: { type: 'integer' },
                        username: { type: 'keyword' },
                        email: { type: 'keyword' },
                        first_name: { type: 'text' },
                        last_name: { type: 'text' },
                        created_at: { type: 'date' },
                        updated_at: { type: 'date' },
                    },
                },
            });
            this.logger.log(`Created index: ${index}`);
        }
    }
}
