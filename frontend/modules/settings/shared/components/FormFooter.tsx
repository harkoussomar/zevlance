import { Alert, AlertDescription } from "@/modules/shared/components/alert";
import { Button } from "@/modules/shared/components/button";
import { CheckCircle2, Loader2, Save } from "lucide-react";

interface FormFooterProps {
  isDirty: boolean;
  isPending: boolean;
  isError: boolean;
  isSaved: boolean;
}

export function FormFooter({ isDirty, isPending, isError, isSaved }: FormFooterProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-6">
      {/* Status feedback */}
      <div className="min-h-5">
        {isError && (
          <Alert variant="destructive" className="py-2 px-3">
            <AlertDescription className="text-xs">
              Failed to save. Please try again.
            </AlertDescription>
          </Alert>
        )}
        {isSaved && !isError && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Changes saved
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isDirty || isPending}
        className="min-w-30 shrink-0"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save changes
          </>
        )}
      </Button>
    </div>
  );
}