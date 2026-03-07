import { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    value: File | null;
    currentImageUrl?: string | null;
    onChange: (file: File | null) => void;
}

export function ImageUpload({ value, currentImageUrl, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const previewUrl = value ? URL.createObjectURL(value) : currentImageUrl || null;

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        onChange(file);
    };

    const handleClear = () => {
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} o`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    };

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />

            {previewUrl ? (
                <div className="relative mt-1 inline-block">
                    <img
                        src={previewUrl}
                        alt="Aperçu"
                        className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleClear}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                    {value && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {value.name} ({formatSize(value.size)})
                        </p>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    className="mt-1 w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground"
                >
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Cliquer pour ajouter une image</span>
                </button>
            )}
        </div>
    );
}
