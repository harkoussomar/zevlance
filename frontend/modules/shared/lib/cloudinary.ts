/**
 * Build an optimized Cloudinary delivery URL.
 * f_auto  → WebP/AVIF based on browser support
 * q_auto  → Cloudinary picks the best quality level
 * w_{n}   → resize to needed width
 */
export function cdnUrl(publicId: string, width = 800): string {
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}
