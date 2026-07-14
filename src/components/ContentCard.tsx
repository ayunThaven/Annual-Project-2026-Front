"use client";

import Image from "next/image";

interface ContentCardProps {
  type: "blog" | "linkedin";
  title: string;
  description: string;
  generatedByAI: boolean;
  onCreate?: () => void;
  onPreview?: () => void;
}

export default function ContentCard({
  type,
  title,
  description,
  generatedByAI,
  onCreate,
  onPreview,
}: ContentCardProps) {
  const typeColors = {
    blog: "bg-purple-100 text-purple-600",
    linkedin: "bg-blue-100 text-blue-600",
  };

  const typeLabels = {
    blog: "Article de blog",
    linkedin: "Post LinkedIn",
  };

  const typeIcons = {
    blog: "/icons/blog.png",
    linkedin: "/icons/linkedin.png",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`w-12 h-12 rounded-lg ${typeColors[type]} flex-shrink-0 flex items-center justify-center`}
        >
          <Image
            src={typeIcons[type]}
            alt=""
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </div>

        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p
              className={`text-sm font-semibold ${
                type === "blog" ? "text-purple-600" : "text-blue-600"
              }`}
            >
              {typeLabels[type]}
            </p>
            {generatedByAI ? (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500">
                IA
              </span>
            ) : null}
          </div>

          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {title}
          </h3>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">{description}</p>

      <div className="flex gap-3">
        <button
          onClick={onCreate}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Image
            src="/icons/creer-white.png"
            alt=""
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <span>Créer</span>
        </button>

        <button
          onClick={onPreview}
          className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <Image
            src="/icons/voir.png"
            alt=""
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </button>
      </div>
    </div>
  );
}
