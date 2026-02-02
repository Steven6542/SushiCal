import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface props {
    bucket: string;
    path: string;
    onUpload: (url: string) => void;
    currentImage?: string;
    label?: string;
}

export function ImageUpload({ bucket, path, onUpload, currentImage, label = "Upload Image" }: props) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${path}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            onUpload(data.publicUrl);

        } catch (error) {
            alert((error as any).message);
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {currentImage ? (
                <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <img
                        src={currentImage}
                        alt="Current"
                        className="h-full w-full object-contain"
                    />
                </div>
            ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                    No Image
                </div>
            )}

            <div className="relative">
                <label
                    htmlFor={`upload-${path}`}
                    className={`cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {uploading ? 'Uploading...' : label}
                </label>
                <input
                    ref={fileInputRef}
                    id={`upload-${path}`}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="hidden"
                />
            </div>
        </div>
    );
}
