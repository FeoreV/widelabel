export interface S3ClientOptions {
    endpoint?: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
}
export interface ObjectMetadata {
    sha256: string;
    contentLength: number;
    contentType: string;
    key: string;
    url: string;
}
export declare class S3StorageAdapter {
    private client;
    private bucket;
    private endpoint;
    constructor(options?: S3ClientOptions);
    getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds?: number): Promise<{
        uploadUrl: string;
        key: string;
        publicUrl: string;
    }>;
    getObjectMetadata(key: string): Promise<ObjectMetadata>;
    uploadObject(key: string, body: Buffer, contentType: string, sha256: string): Promise<{
        key: string;
        publicUrl: string;
        sha256: string;
    }>;
}
