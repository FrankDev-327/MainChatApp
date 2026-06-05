import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ElascitServiceService } from './elascit-service.service';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_NODE,
    }),
  ],
  providers: [ElascitServiceService],
  exports: [ElascitServiceService],
})
export class ElascitServiceModule {}
