import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useCallback, type FormEvent } from "react";

export function APITester() {
  const responseInputRef = useRef<HTMLTextAreaElement>(null);

  const testEndpoint = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!responseInputRef.current) return;

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const endpoint = formData.get("endpoint");
      const method = formData.get("method");

      if (!endpoint || typeof endpoint !== "string") {
        throw new Error("Endpoint is required");
      }

      if (!method || typeof method !== "string") {
        throw new Error("Method is required");
      }

      const url = new URL(endpoint, location.href);
      const res = await fetch(url, { method });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      responseInputRef.current.value = JSON.stringify(data, null, 2);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      responseInputRef.current.value = `Error: ${errorMessage}`;
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={testEndpoint} className="flex items-center gap-2">
        <Label htmlFor="method" className="sr-only">
          Method
        </Label>
        <Select name="method" defaultValue="GET">
          <SelectTrigger className="w-[100px]" id="method">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
          </SelectContent>
        </Select>
        <Label htmlFor="endpoint" className="sr-only">
          Endpoint
        </Label>
        <Input id="endpoint" type="text" name="endpoint" defaultValue="/api/hello" placeholder="/api/hello" />
        <Button type="submit" variant="secondary">
          Send
        </Button>
      </form>
      <Label htmlFor="response" className="sr-only">
        Response
      </Label>
      <Textarea
        ref={responseInputRef}
        id="response"
        readOnly
        placeholder="Response will appear here..."
        className="min-h-[140px] font-mono resize-y"
      />
    </div>
  );
}
