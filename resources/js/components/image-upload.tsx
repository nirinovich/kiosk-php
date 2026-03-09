import { useEffect, useMemo, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    value: File | null;
    currentImageUrl?: string | null;
    removeCurrent?: boolean;
    onChange: (file: File | null) => void;
    onRemoveCurrentChange?: (remove: boolean) => void;
}

export function ImageUpload({ value, currentImageUrl, removeCurrent = false, onChange, onRemoveCurrentChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const previewUrl = useMemo(() => {
        if (value) {
            return URL.createObjectURL(value);
        }

        if (!currentImageUrl || removeCurrent) {
            return null;
        }

        if (/^(https?:)?\/\//.test(currentImageUrl) || currentImageUrl.startsWith('/')) {
            return currentImageUrl;
        }

        return `/${currentImageUrl.replace(/^\/+/, '')}`;
    }, [currentImageUrl, removeCurrent, value]);

    useEffect(() => {
        return () => {
            if (value && previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, value]);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        onChange(file);

        if (file) {
            onRemoveCurrentChange?.(false);
        }
    };

    const handleClear = () => {
        onChange(null);

        if (currentImageUrl) {
            onRemoveCurrentChange?.(true);
        }

        if (inputRef.current) {
            inputRef.current.value = '';
        }
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
                <div className="relative mt-1 inline-block overflow-hidden rounded-lg border bg-muted/30">
                    <button type="button" onClick={handleClick} className="block">
                        <img
                            src={previewUrl}
                            alt="Aperçu"
                            className="h-32 w-32 rounded-lg border object-cover transition-opacity hover:opacity-90"
                        />
                    </button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full"
                        onClick={handleClear}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-center text-[11px] text-white">
                        Cliquer sur l'image pour modifier
                    </div>
                    {value && (
                        <p className="mt-2 text-xs text-muted-foreground">
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
