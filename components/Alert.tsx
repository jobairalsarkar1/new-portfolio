import { close } from "@/public/assets";
import Image, { StaticImageData } from "next/image";

type AlertProps = {
  type: "danger" | "success";
  text: string;
  setAlert: (is: boolean) => void;
};

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
            src={close as StaticImageData}
            alt="close"
            className="w-5 h-5 cursor-pointer"
            width={20}
            height={20}
          />
        </button>
      </div>
    </div>
  );
};

export default Alert;
