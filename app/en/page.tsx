import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EnglishVersionPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-8">English Version</h1>
      <p className="text-lg text-slate-300 mb-6">
        This page will contain the English version of the website.
      </p>
      <p className="text-slate-400 mb-8">
        We are working on translating the content to provide a better experience for our international users.
      </p>
      <Button asChild>
        <Link href="/">Go back to Russian version</Link>
      </Button>
    </div>
  );
}
