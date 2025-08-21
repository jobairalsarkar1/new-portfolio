import { 
    css,
    html,
    javascript,
    mongodb,
    nodejs,
    reactjs,
    tailwind,
    typescript,
    threejs,
    git,
    github,
    unihelper,
    tatboard,
    promptart,
    csv_lab,
    python,
    java,
    flask,
    sql,
    prisma,
    postgresql,
    express,
    vite,
    azure,
    nextjs,
    azureopenai,
    cloudflare,
    cloudinary,
    redaxify, } from "@/public/assets";
    
import * as THREE from "three";
import { Project } from "./types";

export const textures = {
  earth: {
    texture: new THREE.TextureLoader().load("/earth/earthmap.jpg"),
    bump: new THREE.TextureLoader().load("/earth/earthbump.jpg"),
  },
  jupiter: {
    texture: new THREE.TextureLoader().load("/jupiter/jupitermap.jpg"),
  },
  mars: {
    texture: new THREE.TextureLoader().load("/mars/marsmap.jpg"),
    bump: new THREE.TextureLoader().load("/mars/marsbump.jpg"),
  },
  mercury: {
    texture: new THREE.TextureLoader().load("/mercury/mercurymap.jpg"),
    bump: new THREE.TextureLoader().load("/mercury/mercurybump.jpg"),
  },
  saturn: {
    texture: new THREE.TextureLoader().load("/saturn/saturnmap.jpg"),
  },
  uranus: {
    texture: new THREE.TextureLoader().load("/uranus/uranus.jpg"),
  },
  sun: {
    texture: new THREE.TextureLoader().load("/sun/sunmap.jpg"),
  },
};

export const techs = [
  { name: "HTML 5", icon: html },
  { name: "CSS 3", icon: css },
  { name: "JavaScript", icon: javascript },
  { name: "TypeScript", icon: typescript },
  { name: "Python", icon: python },
  { name: "Java", icon: java },
  { name: "React JS", icon: reactjs },
  { name: "Next.js", icon: nextjs, needsBg: true },
  { name: "Node.js", icon: nodejs },
  { name: "Express.js", icon: express, needsBg: true },
  { name: "Flask", icon: flask, needsBg: true },
  { name: "Tailwind CSS", icon: tailwind },
  { name: "Three.js", icon: threejs, needsBg: true },
  { name: "SQL", icon: sql },
  { name: "MongoDB", icon: mongodb },
  { name: "PostgreSQL", icon: postgresql },
  { name: "Prisma", icon: prisma, needsBg: true },
  { name: "Git", icon: git },
  { name: "GitHub", icon: github, needsBg: true },
  { name: "Vite", icon: vite },
  { name: "Azure", icon: azure },
  { name: "Azure OpenAI", icon: azureopenai },
  { name: "Cloudflare", icon: cloudflare },
  { name: "Cloudinary", icon: cloudinary },
];

export const projects: Project[] = [
  {
    iconUrl: unihelper,
    name: "UniHelper",
    description:
      "UniHelper is a university management web application designed to simplify and enhance workflows for Admins, Students, and Teachers. With role-specific features like course advising, classroom management, consultation requests, and payment tracking, it addresses key needs efficiently. This web app offers a modern, user-friendly, and responsive design, making it accessible across devices while streamlining academic operations.",
    stacks: [
      { name: "nodejs", color: "text-green-600" },
      { name: "react", color: "text-blue-500" },
      { name: "mongodb", color: "text-green-700" },
      { name: "javascript", color: "text-yellow-400" },
      { name: "express", color: "text-green-500" },
      { name: "tailwindcss", color: "text-sky-400" },
    ],
    link: "https://uni-helper-five.vercel.app/",
    gitLink: "https://github.com/jobairalsarkar1/UniHelper",
  },
  {
    iconUrl: redaxify,
    name: "Redaxify",
    description:
      "Redaxify is a powerful video indexing tool that leverages Azure AI Video Indexer to extract insights from video content. It features a custom-built video player, automatic video summarization using Azure OpenAI, and secure video uploads via Azure Cloud Storage. The platform includes a subscription-based system integrated with Stripe for seamless payments. Built with Next.js 15, PostgreSQL, and Prisma, Redaxify offers a scalable and efficient solution for managing and analyzing video data.",
    stacks: [
      { name: "nextjs 15", color: "text-slate-500" },
      { name: "tailwindcss", color: "text-sky-400" },
      { name: "postgresql", color: "text-blue-700" },
      { name: "prisma", color: "text-purple-600" },
      { name: "stripe", color: "text-pink-500" },
      { name: "azure ai", color: "text-blue-500" },
      { name: "azure openai", color: "text-indigo-500" },
      { name: "azure cloud storage", color: "text-cyan-500" },
    ],
    link: "https://www.redaxify.com/",
  },
  {
    iconUrl: promptart,
    name: "PromptArt",
    description:
      "PromptArt is a creative web application that transforms text prompts into stunning AI-generated images using Stability AI's powerful image generation API. Built with React and styled with Tailwind CSS, it offers real-time updates through WebSocket integration and a fully responsive design for seamless user interaction.",
    stacks: [
      { name: "nodejs", color: "text-green-600" },
      { name: "react", color: "text-blue-500" },
      { name: "mongodb", color: "text-green-700" },
      { name: "javascript", color: "text-yellow-400" },
      { name: "express", color: "text-green-500" },
      { name: "tailwindcss", color: "text-sky-400" },
      { name: "stability AI", color: "text-violet-400" },
      { name: "websocket", color: "text-sky-500" },
    ],
    link: "https://prompt-art-psi.vercel.app/",
    gitLink: "https://github.com/jobairalsarkar1/prompt_art",
  },
  {
    iconUrl: tatboard,
    name: "TATBoard",
    description:
      "Tatboard is a lightweight web app designed as a digital ledger for managing customer information. With secure login/logout functionality, only the main user can access and organize data efficiently. Ideal for small-scale or personal use, Tatboard offers a modern solution for customer record-keeping.",
    stacks: [
      { name: "flask", color: "text-red-600" },
      { name: "python", color: "text-yellow-600" },
      { name: "sqlite", color: "text-blue-700" },
    ],
    gitLink: "https://github.com/jobairalsarkar1/TATBoard",
  },
  {
    iconUrl: csv_lab,
    name: "3D Lab Design",
    description:
      "The 3D Lab Room is an interactive 3D space built using Three.js and Vite. You can Zoom In, Zoom Out, Rotate.",
    stacks: [
      { name: "react", color: "text-blue-500" },
      { name: "three.js", color: "text-slate-400" },
      { name: "javascript", color: "text-yellow-400" },
    ],
    link: "https://3d-lab-room.vercel.app/",
    gitLink: "https://github.com/jobairalsarkar1/3d_lab_room",
  },
];
