import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Paper Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The research paper you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/paper">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </Link>
      </div>
    </div>
  );
}
