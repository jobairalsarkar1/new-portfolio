import { close } from "@/public/assets";
import Image from "next/image";

interface AlertProps {
  type: "danger" | "success";
  text: string;
  setAlert: (show: boolean) => void;
}

const Alert = ({ type, text, setAlert }: AlertProps) => {
  return (
    <div className="absolute top-12 right-0 left-0 flex items-center justify-center text-white z-50">
      <div
        className={`${
          type === "danger" ? "bg-red-500" : "bg-green-400"
        } py-2 px-3 flex items-center gap-5 rounded-md`}
      >
        <span className="text-sm font-bold">{text}</span>
        <button
          type="button"
          className="w-5 h-5 cursor-pointer"
          onClick={() => setAlert(false)}
        >
          <Image
            src={close}
            alt="close"
            width={20}
            height={20}
            className="w-5 h-5 cursor-pointer"
          />
        </button>
      </div>
    </div>
  );
};

export default Alert;
