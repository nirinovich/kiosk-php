import { Html5Qrcode } from 'html5-qrcode';
import { ScanBarcode, Camera, CameraOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface BarcodeScannerProps {
    open: boolean;
    onClose: () => void;
    onScan: (barcode: string) => void;
}

type ScanStatus = 'idle' | 'scanning' | 'success' | 'not_found' | 'error';

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
    const [status, setStatus] = useState<ScanStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [lastScanned, setLastScanned] = useState('');
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerRef = useRef<string>('barcode-scanner-container');
    const isStartingRef = useRef(false);
    const cooldownRef = useRef(false);

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                // State 2 = SCANNING, State 3 = PAUSED
                if (state === 2 || state === 3) {
                    await scannerRef.current.stop();
                }
            } catch {
                // Scanner may already be stopped
            }
            try {
                scannerRef.current.clear();
            } catch {
                // Ignore clear errors
            }
            scannerRef.current = null;
        }
    }, []);

    const startScanner = useCallback(async (cameraId?: string) => {
        if (isStartingRef.current) return;
        isStartingRef.current = true;

        try {
            await stopScanner();

            // Small delay to ensure DOM is ready
            await new Promise(resolve => setTimeout(resolve, 300));

            const container = document.getElementById(scannerContainerRef.current);
            if (!container) {
                isStartingRef.current = false;
                return;
            }

            const scanner = new Html5Qrcode(scannerContainerRef.current);
            scannerRef.current = scanner;

            // Get available cameras
            const devices = await Html5Qrcode.getCameras();
            if (devices.length === 0) {
                setStatus('error');
                setErrorMessage("Aucune caméra trouvée. Vérifiez les permissions de votre navigateur.");
                isStartingRef.current = false;
                return;
            }

            setCameras(devices);

            // Prefer back camera (environment) for phone scanning
            const targetCamera = cameraId || devices.find(d =>
                d.label.toLowerCase().includes('back') ||
                d.label.toLowerCase().includes('arrière') ||
                d.label.toLowerCase().includes('environment')
            )?.id || devices[0].id;

            setSelectedCamera(targetCamera);
            setStatus('scanning');

            await scanner.start(
                targetCamera,
                {
                    fps: 10,
                    qrbox: { width: 280, height: 150 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    // Cooldown to prevent rapid duplicate scans
                    if (cooldownRef.current) return;
                    cooldownRef.current = true;

                    setLastScanned(decodedText);
                    setStatus('success');
                    onScan(decodedText);

                    // Reset cooldown after 2 seconds
                    setTimeout(() => {
                        cooldownRef.current = false;
                        setStatus('scanning');
                    }, 2000);
                },
                () => {
                    // QR code not found in frame — this fires continuously, ignore
                }
            );
        } catch (err: any) {
            console.error('Scanner error:', err);
            setStatus('error');
            if (err?.message?.includes('Permission') || err?.name === 'NotAllowedError') {
                setErrorMessage(
                    "Accès à la caméra refusé. Autorisez l'accès à la caméra dans les paramètres de votre navigateur."
                );
            } else if (err?.message?.includes('secure context') || err?.message?.includes('HTTPS')) {
                setErrorMessage(
                    "La caméra nécessite une connexion sécurisée (HTTPS). Utilisez localhost ou un tunnel HTTPS (ex: ngrok)."
                );
            } else {
                setErrorMessage(
                    err?.message || "Erreur lors du démarrage de la caméra."
                );
            }
        } finally {
            isStartingRef.current = false;
        }
    }, [stopScanner, onScan]);

    // Start/stop scanner when dialog opens/closes
    useEffect(() => {
        if (open) {
            // Small delay to ensure the dialog DOM is rendered
            const timer = setTimeout(() => {
                startScanner();
            }, 500);
            return () => clearTimeout(timer);
        } else {
            stopScanner();
            setStatus('idle');
            setErrorMessage('');
            setLastScanned('');
        }
    }, [open, startScanner, stopScanner]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, [stopScanner]);

    const switchCamera = async () => {
        const currentIndex = cameras.findIndex(c => c.id === selectedCamera);
        const nextIndex = (currentIndex + 1) % cameras.length;
        const nextCamera = cameras[nextIndex];
        if (nextCamera) {
            await startScanner(nextCamera.id);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <ScanBarcode className="h-5 w-5 text-primary" />
                        Scanner un code-barres
                    </DialogTitle>
                    <DialogDescription>
                        Placez le code-barres devant la caméra pour l'ajouter à la commande.
                    </DialogDescription>
                </DialogHeader>

                {/* Camera viewport */}
                <div className="relative bg-black">
                    {/* Camera feed container - html5-qrcode renders here */}
                    <div
                        id={scannerContainerRef.current}
                        className="w-full min-h-[300px]"
                        style={{ position: 'relative' }}
                    />

                    {/* Scanning overlay */}
                    {status === 'scanning' && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="relative w-[280px] h-[150px]">
                                {/* Corner brackets */}
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-md" />
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-md" />
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-md" />
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-md" />

                                {/* Scanning line animation */}
                                <div className="absolute left-2 right-2 h-0.5 bg-primary/80 animate-scan-line" />
                            </div>
                        </div>
                    )}

                    {/* Success overlay */}
                    {status === 'success' && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center transition-all duration-300 pointer-events-none">
                            <div className="flex flex-col items-center gap-2 bg-background/90 rounded-xl px-6 py-4 shadow-lg">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Code détecté !</p>
                                <code className="text-xs bg-muted px-3 py-1 rounded-md font-mono">{lastScanned}</code>
                            </div>
                        </div>
                    )}

                    {/* Error state */}
                    {status === 'error' && (
                        <div className="absolute inset-0 bg-background/95 flex items-center justify-center p-6">
                            <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                                <CameraOff className="h-12 w-12 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startScanner()}
                                    className="mt-2"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Réessayer
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between px-6 pb-6 pt-3">
                    <div className="text-xs text-muted-foreground">
                        {status === 'scanning' && (
                            <span className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Caméra active
                            </span>
                        )}
                        {status === 'success' && (
                            <span className="text-green-600 font-medium">✓ {lastScanned}</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {cameras.length > 1 && status === 'scanning' && (
                            <Button variant="outline" size="sm" onClick={switchCamera}>
                                <Camera className="h-4 w-4 mr-1.5" />
                                Changer
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            Fermer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
