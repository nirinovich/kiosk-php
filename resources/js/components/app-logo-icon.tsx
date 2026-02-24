import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
            <polygon
                fill="currentColor"
                points="440.68 456.25 791.77 103.51 686.07 103.51 440.68 456.25"
            />
            <polygon
                fill="currentColor"
                points="111.37 797.25 111.37 22.11 389.02 22.11 389.02 517.34 111.37 797.25"
            />
            <path
                fill="currentColor"
                d="M738.69,563.25h0L695,499.93l-.37.48c-27.42-38.72-57.61-80.53-58.27-77.88-1.22,4.87-9.74,14.65-9.74,14.65l-179,158.26,83.75,119.15,237.89,343.3H1080.3Z"
            />
            <polygon
                fill="currentColor"
                points="998.04 22.11 791.82 78.76 864.75 120.8 212.89 799.84 111.54 898.17 111.54 1057.69 111.37 1057.89 345.25 1057.89 345.25 925.27 921.39 169.44 974.15 235.04 998.4 22.56 998.04 22.11"
            />
        </svg>
    );
}
