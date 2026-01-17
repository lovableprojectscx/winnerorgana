import * as React from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { LEGAL_DOCS, type LegalDocId } from "./legalDocuments";

type LegalSheetProps = {
  doc: LegalDocId;
  children: React.ReactNode;
  triggerClassName?: string;
};

const LegalSheet = ({ doc, children, triggerClassName }: LegalSheetProps) => {
  const data = LEGAL_DOCS[doc];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button" className={triggerClassName}>
          {children}
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader className="pr-10">
          <SheetTitle className="font-heading text-2xl md:text-3xl">
            {data.title}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Última actualización: {data.lastUpdated}
          </p>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-10rem)] pr-4">
          <article
            className={cn(
              "max-w-none space-y-6 text-muted-foreground",
              "prose prose-sm sm:prose-base",
              "prose-headings:font-heading prose-headings:text-foreground",
              "prose-strong:text-foreground"
            )}
          >
            {data.content}
          </article>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default LegalSheet;
