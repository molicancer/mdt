import { FunctionComponent } from "react";

interface InfoTextProps {
  textOpacity: number;
}

export const InfoText: FunctionComponent<InfoTextProps> = ({ textOpacity }) => {
  return (
    <div className="w-full text-center transition-opacity duration-700"
        style={{ opacity: textOpacity }}>
      <p className="text-base text-gray-700 font-medium px-4">
        每周收集精彩的设计资讯与灵感，带您了解设计与科技的最新趋势
      </p>
    </div>
  );
}; 