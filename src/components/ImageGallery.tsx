
import { WordImage } from "@/data/words";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: WordImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<WordImage | null>(
    images.length > 0 ? images[0] : null
  );
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Preload all images
    images.forEach((image) => {
      const img = new Image();
      img.src = image.url;
      img.onload = () => {
        setLoadedImages((prev) => ({
          ...prev,
          [image.id]: true,
        }));
      };
    });
  }, [images]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="relative rounded-lg overflow-hidden h-48 md:h-64 mb-3 bg-secondary">
        {selectedImage && (
          <img
            src={selectedImage.url}
            alt={selectedImage.alt}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              loadedImages[selectedImage.id] ? "image-loaded" : "image-loading"
            )}
          />
        )}
      </div>
      
      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className={cn(
              "rounded-md min-w-16 h-16 overflow-hidden border-2 transition-all duration-200",
              selectedImage?.id === image.id
                ? "border-primary"
                : "border-transparent hover:border-primary/50"
            )}
          >
            <img
              src={image.url}
              alt={image.alt}
              className={cn(
                "w-full h-full object-cover transition-all duration-500",
                loadedImages[image.id] ? "image-loaded" : "image-loading"
              )}
            />
          </button>
        ))}
        {images.length > 3 && (
          <div className="flex items-center justify-center min-w-16 h-16 bg-secondary rounded-md">
            <span className="text-xs text-muted-foreground">+{images.length - 3}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageGallery;
