"use server";

import { headers } from "next/headers";
import { cache } from "react";
import { env } from "~/env";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";

interface GenerateSpeechData {
  project_name: string;
  text: string;
  voice_s3_key: string;
  language: string;
  exaggeration: number;
  cfg_weight: number;
}

interface GenerateSpeechResult {
  success: boolean;
  s3_key?: string;
  audioUrl?: string;
  projectId?: string;
  error?: string;
}

const S3_BUCKET_URL = `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com`;

interface UserAudioProjectListItem {
  id: string;
  s3Key: string;
  audioUrl: string;
  text: string;
  language: string;
  createdAt: Date;
}

export interface GetUserAudioProjectsResult {
  success: boolean;
  projects: UserAudioProjectListItem[];
  error?: string;
}

export const generateSpeech = async (
  data: GenerateSpeechData,
): Promise<GenerateSpeechResult> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: No user session found" };
    }

    if (!data.text || !data.voice_s3_key || !data.language) {
      return { success: false, error: "Missing required parameters" };
    }

    const creditsNeeded = Math.max(1, Math.ceil(data.text.length / 100)); // Example: 1 credit per 100 characters

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.credits < creditsNeeded) {
      return { success: false, error: "Insufficient credits" };
    }

    // Call TTS generation logic (e.g., using Modal API)
    const response = await fetch(env.MODAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Modal-Key": env.MODAL_API_KEY,
        "Modal-Secret": env.MODAL_API_SECRET,
      },
      body: JSON.stringify({
        text: data.text,
        voice_s3_key: data.voice_s3_key,
        language: data.language,
        exaggeration: data.exaggeration ?? 0.5,
        cfg_weight: data.cfg_weight ?? 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TTS generation failed:", {
        status: response.status,
        body: errorText,
      });
      return {
        success: false,
        error: `TTS generation failed (HTTP ${response.status})`,
      };
    }

    const result = (await response.json()) as {
      generated_audio_s3_key: string;
    };

    const audioUrl = `${S3_BUCKET_URL}/${result.generated_audio_s3_key}`;

    // Deduct credits
    await db.user.update({
      where: { id: session.user.id },
      data: {
        credits: {
          decrement: creditsNeeded,
        },
      },
    });

    const audioProject = await db.audioProject.create({
      data: {
        name: data.project_name,
        text: data.text,
        audioUrl: audioUrl,
        s3Key: result.generated_audio_s3_key,
        language: data.language,
        voiceS3Key: data.voice_s3_key,
        exaggeration: data.exaggeration,
        cfgWeight: data.cfg_weight,
        userId: session.user.id,
      },
    });

    return {
      success: true,
      s3_key: result.generated_audio_s3_key,
      audioUrl,
      projectId: audioProject.id,
    };
  } catch (error) {
    console.error("Error generating speech:", error);
    return {
      success: false,
      error: "An error occurred while generating speech",
    };
  }
};

export const getUserAudioProjects = cache(
  async (): Promise<GetUserAudioProjectsResult> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        projects: [],
        error: "Unauthorized: No user session found",
      };
    }

    const projects = await db.audioProject.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        s3Key: true,
        audioUrl: true,
        text: true,
        language: true,
        createdAt: true,
      },
    });

    return { success: true, projects };

  } catch (error) {
    console.error("Error fetching user audio projects:", error);
    return {
      success: false,
      projects: [],
      error: "An error occurred while fetching audio projects",
    };
  }
  },
);

export const getUserCredits = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        credits: 0,
        error: "Unauthorized: No user session found",
      };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return { success: false, credits: 0, error: "User not found" };
    }

    return { success: true, credits: user.credits };
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return {
      success: false,
      credits: 0,
      error: "An error occurred while fetching credits",
    };
  }
});
