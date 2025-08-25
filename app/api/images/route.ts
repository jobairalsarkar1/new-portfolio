import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { auth } from "@/auth";

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Edge cache: cache response globally for 60 seconds
export const revalidate = 60;

// Optional: increase size limit for larger image uploads
export const maxSize = 20 * 1024 * 1024; // 20 MB

// GET: all uploaded images
export async function GET() {
  try {
    const images = await prisma.image.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    console.error("GET /api/images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// POST: upload image to Cloudinary and save metadata
export async function POST(req: NextRequest) {
  try {
    // Authorization Check
    const session = await auth();
    if (!session?.user?.email && session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file || !name) {
      return NextResponse.json(
        { success: false, error: "Missing 'file' or 'name' in form data" },
        { status: 400 }
      );
    }

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            folder: "portfolio/images",
            public_id: name,
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    // Save image data to database
    const newImage = await prisma.image.create({
      data: {
        name,
        url: uploadResult.secure_url,
      },
    });

    return NextResponse.json({ success: true, data: newImage }, { status: 201 });
  } catch (error) {
    console.error("POST /api/images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
