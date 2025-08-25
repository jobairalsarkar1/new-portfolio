import { StaticImageData } from "next/image";

export interface Stack {
  name: string;
  color: string;
}

export interface Project {
  iconUrl: StaticImageData | string;
  // coverImage: StaticImageData | string;
  // heroImage?: StaticImageData | string;
  name: string;
  description: string;
  stacks: Stack[];
  link?: string;
  gitLink?: string;
}
