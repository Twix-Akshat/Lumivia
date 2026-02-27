import { NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"

export async function POST(req: Request) {
    try {
        const data = await req.formData()
        const file = data.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

        const upload = await cloudinary.uploader.upload(base64, {
            folder: "profile_pictures",
            transformation: [
                { width: 300, height: 300, crop: "fill" },
                { quality: "auto" },
                { fetch_format: "auto" },
            ],
        })

        return NextResponse.json({
            url: upload.secure_url,
        })
    } catch (error) {
        console.error("Cloudinary upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}