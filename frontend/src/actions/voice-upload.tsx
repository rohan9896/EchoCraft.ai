"use server";

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { headers } from "next/headers";
import { cache } from "react";
import { env } from "~/env";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";

const s3Client = new S3Client({
    region: env.AWS_REGION ?? "us-east-1",
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? "",
    },
});

interface UploadVoiceResult {
    success: boolean;
    id?: string;
    s3Key?: string;
    error?: string; 
    url?: string;
}

export const uploadVoice = async (formData: FormData): Promise<UploadVoiceResult> => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized: No user session found" };
        }

        if(!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_S3_BUCKET_NAME) {
            return { success: false, error: "AWS S3 credentials are not configured" };
        }

        const file = formData.get("file") as File;

        if(!file) {
            return { success: false, error: "No file provided" };
        }

        if(!file.type.startsWith("audio/")) {
            return { success: false, error: "Invalid file type. Only audio files are allowed." };
        }


        if(file.size > 10 * 1024 * 1024) { // 10 MB limit
            return { success: false, error: "File size exceeds the 10 MB limit." };
        }

        const fileExtension = file.name.split(".").pop();

        const fileName = `voices/${session.user.id}/${Date.now()}.${fileExtension}`;

        // Upload the file to S3
        const uploadParams = {
            Bucket: env.AWS_S3_BUCKET_NAME ?? "",
            Key: fileName,
            Body: Buffer.from(await file.arrayBuffer()),
            ContentType: file.type,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        const url = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET_NAME ?? "", Key: fileName }), { expiresIn: 3600 * 24 * 7 }); // URL valid for 7 days

        const uploadedVoice = await db.uploadedVoice.create({
            data: {
                name: file.name,
                userId: session.user.id,
                s3Key: fileName,
                url,
            },
        });

        return { success: true, id: uploadedVoice.id, s3Key: fileName, url };
    } catch (error) {
        console.error("Uploading voice error:", error);
        return { success: false, error: (error as Error).message };
    }
};

export const getUserUploadedVoices = cache(async () => {
    try {

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return { success: false, voices: [], error: "Unauthorized: No user session found" };
        }

        const voices = await db.uploadedVoice.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, voices }; 

    } catch(error) {
        console.error("Error fetching user uploaded voices:", error);
        return { success: false, voices: [], error: (error as Error).message };
    }
});