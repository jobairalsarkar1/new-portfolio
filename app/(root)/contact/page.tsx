"use client";

import { Suspense, useState, ChangeEvent, FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Link from "next/link";
import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaTwitter,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Loader from "@/components/Loader";
import Earth from "@/components/Earth";
import Alert from "@/components/Alert";

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
      {/* Header */}
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

      <div className="flex flex-col lg:flex-row items-start justify-center gap-6 w-full">
        {/* Form */}
        <div className="w-full lg:w-1/2 flex flex-col mt-0 sm:mt-5 p-0 sm:p-4 rounded-2xl">
          <h1 className="head-text text-white mb-6 text-center lg:text-left">
            Start Your{" "}
            <span className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text font-extrabold">
              Project
            </span>{" "}
            Here
          </h1>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            {/* Message */}
            <textarea
              name="message"
              placeholder="Tell me about your project, goals, or challenges — I’ll get back to you with solutions."
              rows={5}
              required
              value={form.message}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
            />

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-main mt-1 text-lg text-white bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900 hover:from-gray-900 hover:via-indigo-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
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

          {/* Contact Info + Socials */}
          <div className="w-full mt-6 sm:mt-7 flex flex-col gap-4">
            {/* Row 1: Phone + Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300">
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
                <FaPhoneAlt className="text-green-400 mt-0.5" />
                <span className="text-base">+8801766961460</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
                <FaMapMarkerAlt className="text-red-400 mt-0.5" />
                <span className="text-base">Dhaka, Bangladesh</span>
              </div>
            </div>

            {/* Row 2: Email + Socials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300 items-center">
              {/* Email */}
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
                <FaEnvelope className="text-yellow-400 mt-1" />
                <span className="text-base">jobair.a.sarkar@gmail.com</span>
              </div>

              {/* Social links (icons only) */}
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="https://www.linkedin.com/in/jobair-al-sarkar/"
                  target="_blank"
                  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
                >
                  <FaLinkedin className="text-blue-600 w-7 h-7" />
                </Link>
                <Link
                  href="https://github.com/jobairalsarkar1"
                  target="_blank"
                  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
                >
                  <FaGithub className="text-gray-200 w-7 h-7" />
                </Link>
                <Link
                  href="https://www.facebook.com/profile.php?id=100081410426667"
                  target="_blank"
                  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
                >
                  <FaFacebook className="text-blue-500 w-7 h-7" />
                </Link>
                <Link
                  href="https://x.com/jobairalsarkar"
                  target="_blank"
                  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
                >
                  <FaTwitter className="text-sky-400 w-7 h-7" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Earth */}
        <div className="w-full lg:w-1/2 h-[400px] md:h-[500px] lg:h-[550px] flex-shrink-0">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            className="w-full h-full"
          >
            <directionalLight intensity={2.5} position={[0, 0, 1]} />
            <ambientLight intensity={0.5} />
            <Suspense fallback={<Loader />}>
              <Earth scale={1.7} rotationSpeed={rotationSpeed} />
            </Suspense>
            <OrbitControls
              enableZoom={false}
              minDistance={2}
              maxDistance={10}
            />
          </Canvas>
        </div>
      </div>
    </section>
  );
};

export default Contact;
