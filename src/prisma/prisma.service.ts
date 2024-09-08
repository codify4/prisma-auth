import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        super({
            datasources: {
                db: {
                    url: 'postgresql://nest-rest_owner:Vz1xGMS5jRNW@ep-long-wave-a2kti39z.eu-central-1.aws.neon.tech/nest-rest?sslmode=require',
                },
            },
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
