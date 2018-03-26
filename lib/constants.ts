export enum Scale {
   Fit,
   Fill,
   None
}

export enum Align {
   Inherit,
   Center
}

interface StyleSettings {
   fonts: { [key: string]: string };
   colors: { [key: string]: number[] };
}

interface StyleRule {
   font?: string;
   fontSize?: number;
   color?: string;
   margin?: number;
   width?: number;
   height?: number;
   inherit?: string;
   align?: Align;
}

export interface Style {
   settings: StyleSettings;
   rules: { [key: string]: StyleRule };
}
