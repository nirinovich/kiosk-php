import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Props {
    errors: Partial<Record<string, string>>;
}

export function FormErrors({ errors }: Props) {
    const entries = Object.entries(errors).filter(([, msg]) => !!msg);
    if (entries.length === 0) return null;

    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur de validation</AlertTitle>
            <AlertDescription>
                <ul className="list-disc pl-5 mt-1">
                    {entries.map(([key, message]) => (
                        <li key={key}>{message}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}
