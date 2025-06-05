"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import axios from "axios";
import { X } from "lucide-react";
import Link from "next/link";

const TagInput = ({
  label,
  values,
  setValues,
}: {
  label: string;
  values: string[];
  setValues: (v: string[]) => void;
}) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      setValues([...values, trimmed]);
      setInput("");
    }
  };

  const removeTag = (tag: string) => {
    setValues(values.filter((v) => v !== tag));
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 mt-1">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          placeholder={`Add ${label} || Press enter to add`}
          className="text-stone-700 text-lg font-medium"
        />
      </div>
      <div className="flex flex-wrap mt-2 gap-2">
        {values.map((tag) => (
          <div
            key={tag}
            className="flex items-center dark:bg-gray-200 bg-gray-700 dark:text-black text-white px-2 py-1 rounded-full text-sm"
          >
            {tag}
            <X
              className="ml-1 h-4 w-4 cursor-pointer"
              onClick={() => removeTag(tag)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SearchPapersPage() {
  const [authors, setAuthors] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPapers = async () => {
    try {
      const params = new URLSearchParams();
      authors.forEach((a) => params.append("authors", a));
      keywords.forEach((k) => params.append("keywords", k));
      titles.forEach((t) => params.append("title", t));
      params.set("page", page.toString());
      params.set("limit", "5");

      const res = await axios.get(`/api/paper?${params.toString()}`);
      const data = res.data;

      setResults(data.papers);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      toast.error("Failed to fetch papers");
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [page]);

  const onSubmit = async () => {
    setPage(1);
    await fetchPapers();
  };

  return (
    <div className="w-full h-screen flex flex-col justify-between md:py-7 py-4 items-center overflow-hidden md:px-10 px-2">
      <div
        className=" mx-auto max-h-full h-full w-full overflow-y-auto scrollbar-hide bg-gray-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md text-black bg-opacity-10 border border-gray-100 md:p-3 p-0"
        style={{
          boxShadow:
            "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
        }}
      >
        <h2 className="md:text-2xl text-xl font-bold mb-4 w-full text-center lg:text-4xl">
          Search Research Papers
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <TagInput label="Authors" values={authors} setValues={setAuthors} />
          <TagInput
            label="Keywords"
            values={keywords}
            setValues={setKeywords}
          />
          <TagInput label="Title" values={titles} setValues={setTitles} />
        </div>
        <div className="flex gap-2 w-full justify-center items-center mb-5">
          <Button onClick={onSubmit}>Search</Button>
          <Button
            variant="destructive"
            onClick={() => {
              setAuthors([]);
              setKeywords([]);
              setTitles([]);
              setPage(1);
            }}
          >
            Clear
          </Button>
        </div>
        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((paper) => (
              <Link
                href={`/paper/${paper.id}`}
                key={paper.id}
                className="block"
              >
                <Card key={paper.id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{paper.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Keywords: {paper.keywords.join(", ")}
                    </p>
                    <p className="text-sm">
                      Author: {paper.author?.name} ({paper.author?.email})
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}

            <div className="flex justify-center gap-4 mt-4">
              <Button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground mt-4">
            No results found.
          </p>
        )}
      </div>{" "}
    </div>
  );
}
