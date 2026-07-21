import { S3Client, PutObjectCommand, HeadObjectCommand, } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export class S3StorageAdapter {
    client;
    bucket;
    endpoint;
    constructor(options = {}) {
        this.endpoint =
            options.endpoint || process.env.S3_URL || "http://localhost:9000";
        this.bucket =
            options.bucket || process.env.S3_BUCKET || "wide-label-assets";
        this.client = new S3Client({
            endpoint: this.endpoint,
            region: options.region || process.env.S3_REGION || "us-east-1",
            credentials: {
                accessKeyId: options.accessKeyId || process.env.S3_ACCESS_KEY_ID || "minioadmin",
                secretAccessKey: options.secretAccessKey ||
                    process.env.S3_SECRET_ACCESS_KEY ||
                    "minioadmin",
            },
            forcePathStyle: true,
        });
    }
    async getPresignedUploadUrl(key, contentType, expiresInSeconds = 900) {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });
        const uploadUrl = await getSignedUrl(this.client, command, {
            expiresIn: expiresInSeconds,
        });
        const publicUrl = `${this.endpoint}/${this.bucket}/${key}`;
        return { uploadUrl, key, publicUrl };
    }
    async getObjectMetadata(key) {
        const command = new HeadObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        const response = await this.client.send(command);
        const sha256 = response.Metadata?.["sha256"] ||
            response.Metadata?.["x-amz-meta-sha256"] ||
            "";
        return {
            sha256,
            contentLength: response.ContentLength || 0,
            contentType: response.ContentType || "application/octet-stream",
            key,
            url: `${this.endpoint}/${this.bucket}/${key}`,
        };
    }
    async uploadObject(key, body, contentType, sha256) {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
            Metadata: {
                sha256,
            },
        });
        await this.client.send(command);
        return {
            key,
            publicUrl: `${this.endpoint}/${this.bucket}/${key}`,
            sha256,
        };
    }
}
