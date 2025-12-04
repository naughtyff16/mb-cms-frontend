
import React from "react";
import { FaImage } from "react-icons/fa";
import { Link } from "react-router";
interface Component {
  title: string;
  image: string;
  id: string;
  type: string;
  asset: any;
  editAccess: boolean;
}

const MbTitle: React.FC<Component> = ({
  title,
  image,
  id,
  type,
  asset,
  editAccess,
}) => {
  return (
    <Link
      className="transition-all flex items-center gap-2 duration-150 ease-linear text-mb-blue hover:text-mb-blue/70"
      to={
        !editAccess
          ? "#"
          : asset.v_status.toUpperCase() === "DRAFT"
          ? `/assets/${type}/draft/${asset.id}`
          : `/assets/${type}/published/${asset.id}`
      }
    >
      {image !== "" ? (
        <img
          alt={"asset icon"}
          src={image}
          width={30}
          height={30}
          className="rounded-full object-cover border-slate-300 border w-[30px] h-[30px]"
        />
      ) : (
        <span className="p-1 rounded-full border border-slate-300">
          <FaImage size={30} className="text-slate-300" />{" "}
        </span>
      )}
      {title}
    </Link>
  );
};

export default MbTitle;
