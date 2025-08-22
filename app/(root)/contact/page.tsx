"use client";

import { Suspense, useState, ChangeEvent, FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { facebook, linkedin } from "@/public/assets";
import Loader from "@/components/Loader";
import Earth from "@/components/Earth";
import Alert from "@/components/Alert";
import Image from "next/image";

interface FormState {
  name: string;
  email: string;
  message: string;
}

interface AlertState {
  is: boolean;
  type: "success" | "danger" | "";
  text: string;
}

const Contact = () => {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    is: false,
    type: "",
    text: "",
  });
  const rotationSpeed = isLoading ? 0.05 : 0.001;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFocus = () => {};
  const handleBlur = () => {};

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: form.name,
          to_name: "Jobair Al Sarkar",
          from_email: form.email,
          to_email: "jobairalsarkar1@gmail.com",
          message: `Message from: ${form.name} (${form.email})\n\n${form.message}`,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_ID!
      )
      .then(() => {
        setIsLoading(false);
        setAlert({
          is: true,
          type: "success",
          text: "Message received.",
        });

        setTimeout(() => {
          setForm({ name: "", email: "", message: "" });
          setAlert({ is: false, type: "", text: "" });
        }, 2000);
      })
      .catch((error) => {
        setIsLoading(false);
        setAlert({
          is: true,
          type: "danger",
          text: "Message is not received!",
        });

        setTimeout(() => {
          setForm({ name: "", email: "", message: "" });
          setAlert({ is: false, type: "", text: "" });
        }, 2000);
        console.log(error);
      });
  };

  return (
    <section className="relative py-12 px-8 text-white z-30">
      {/* Header section matching Projects page */}
      <div className="px-1 sm:px-4 py-4 rounded-lg mt-8 mb-2">
        <h3 className="head-text">
          Let’s Build Something Amazing{" "}
          <span className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text font-extrabold">
            Together
          </span>
        </h3>
        <p className="subhead-text text-gray-200 mt-2 sm:text-justify">
          Have a project idea, a business challenge, or just need a skilled
          developer to bring your vision to life? I specialize in building
          modern, scalable, and reliable software solutions. Whether it’s a web
          app, an API, or a full-stack project — let’s discuss how I can help
          turn your ideas into reality.
        </p>
      </div>

      {alert.is && alert.type !== "" && (
        <Alert
          type={alert.type as "success" | "danger"}
          text={alert.text}
          setAlert={(is: boolean) => setAlert({ ...alert, is })}
        />
      )}

      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full">
        {/* Form Container */}
        <div className="w-full lg:w-1/2 flex flex-col  p-4 rounded-2xl">
          <h1 className="head-text text-white mb-4 text-center lg:text-left">
            Start Your Project Here
          </h1>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-white font-medium text-sm">
                Name
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="mt-1.5 w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </label>

              <label className="text-white font-medium text-sm">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="mt-1.5 w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </label>
            </div>

            {/* Message */}
            <label className="text-white font-medium text-sm">
              Message
              <textarea
                name="message"
                placeholder="Tell me about your project, goals, or challenges — I’ll get back to you with solutions."
                rows={4}
                required
                value={form.message}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="mt-1.5 w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
              />
            </label>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="btn-main mt-2 text-white bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900 hover:from-gray-900 hover:via-indigo-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin w-5 h-5" />
                  Sending...
                </>
              ) : (
                "Send Your Message"
              )}
            </button>
          </form>

          {/* SOCIAL LINKS */}
          <div className="w-full mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="https://www.linkedin.com/in/jobair-al-sarkar/"
              target="_blank"
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition"
            >
              <Image
                src={linkedin}
                alt="LinkedIn"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full"
              />
              <span className="text-gray-300 text-sm hidden sm:inline">
                LinkedIn
              </span>
            </Link>

            <Link
              href="https://github.com/jobairalsarkar1"
              target="_blank"
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition"
            >
              <FaGithub className="w-7 h-7 text-gray-200" />
              <span className="text-gray-300 text-sm hidden sm:inline">
                GitHub
              </span>
            </Link>

            <Link
              href="https://www.facebook.com/profile.php?id=100081410426667"
              target="_blank"
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition"
            >
              <Image
                src={facebook}
                alt="Facebook"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full"
              />
              <span className="text-gray-300 text-sm hidden sm:inline">
                Facebook
              </span>
            </Link>

            <Link
              href="https://x.com/jobairalsarkar"
              target="_blank"
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition"
            >
              <FaXTwitter className="w-7 h-7 text-gray-200" />
              <span className="text-gray-300 text-sm hidden sm:inline">
                Twitter
              </span>
            </Link>
          </div>
        </div>

        {/* Earth Model Container */}
        <div className="w-full lg:w-1/2 h-[400px] md:h-[500px] lg:h-[550px] flex-shrink-0">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 1000 }}
            className="w-full h-full"
          >
            <directionalLight intensity={2.5} position={[0, 0, 1]} />
            <ambientLight intensity={0.5} />
            <Suspense fallback={<Loader />}>
              <Earth scale={1.7} rotationSpeed={rotationSpeed} />
            </Suspense>
            <OrbitControls enableZoom={true} minDistance={2} maxDistance={10} />
          </Canvas>
        </div>
      </div>
    </section>
  );
};

export default Contact;
