import AppLogoIcon from './app-logo-icon';

interface KioskLogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

const sizeMap = {
    sm: { icon: 'size-8', text: 'text-lg' },
    md: { icon: 'size-12', text: 'text-2xl' },
    lg: { icon: 'size-16', text: 'text-4xl' },
};

export default function KioskLogo({ size = 'md', showText = true }: KioskLogoProps) {
    const s = sizeMap[size];

    return (
        <div className="flex items-center gap-3">
            <div
                className={`flex ${s.icon} items-center justify-center rounded-xl bg-primary text-primary-foreground`}
            >
                <AppLogoIcon className={`${s.icon} p-1 fill-current`} />
            </div>
            {showText && (
                <span className={`${s.text} font-bold tracking-tight`}>
                    Kiosk
                </span>
            )}
        </div>
    );
}
