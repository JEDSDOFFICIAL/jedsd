import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import React from "react";
import axios from "axios";

const fetchNews = async () => {
  const response = await axios.get("/api/user/news");
  if (response.status !== 200) {
    throw new Error("Failed to fetch news");
  }
  return response.data;
};


const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4 bg-white",
       
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function MarqueeDemo() {
  const [reviews, setReviews] = React.useState<any[]>([]);
  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await fetchNews();
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };
    fetchReviews();
  }, []);
  return (
    <div className="relative h-fit flex  flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {reviews.map((review) => (
          <ReviewCard  key={review.username} {...review} />
        ))}
      </Marquee>
    </div>
  );
}
