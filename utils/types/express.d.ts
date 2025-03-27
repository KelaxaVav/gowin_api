// express.d.ts
import { Request, Response } from 'express';

interface PaginationMeta {
    page?: number;
    size?: number;
}

interface PaginationConfig {
    offset?: number;
    limit?: number;
}

interface Meta extends PaginationMeta {
    message: string;
    status?: number;
    total?: number;
}

declare module 'express' {
    export interface Response {
        sendRes: (data?: any[] | object | undefined, meta: Meta) => void;
    }
    export interface Request {
        auth: {
            user_id: string;
        };
        branch: {
            branch_id: string;
        };
        device: {
            device_id: string;
        };
        meta: PaginationMeta;
        paginate: PaginationConfig;
    }
}