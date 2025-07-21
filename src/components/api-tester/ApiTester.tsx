import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { RequestBuilder } from "./RequestBuilder";
import { ResponseViewer } from "./ResponseViewer";
import { useToast } from "@/hooks/use-toast";

interface Request {
  id: string;
  name: string;
  method: string;
  url: string;
  timestamp?: Date;
}

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  timing: number;
  size: number;
}

export function ApiTester() {
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSelectRequest = (request: Request) => {
    // This would populate the request builder with the selected request
    toast({
      title: "Request loaded",
      description: `Loaded ${request.method} ${request.name}`,
    });
  };

  const handleSendRequest = async (requestData: any) => {
    setLoading(true);
    const startTime = Date.now();

    try {
      // Prepare headers
      const headers: Record<string, string> = { ...requestData.headers };
      
      // Add auth header if needed
      if (requestData.auth.type === "bearer" && requestData.auth.token) {
        headers.Authorization = `Bearer ${requestData.auth.token}`;
      }

      // Make the request
      const fetchOptions: RequestInit = {
        method: requestData.method,
        headers,
      };

      if (requestData.body && requestData.method !== "GET") {
        fetchOptions.body = requestData.body;
      }

      const response = await fetch(requestData.url, fetchOptions);
      const timing = Date.now() - startTime;

      // Parse response
      let data;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Calculate response size (approximate)
      const responseText = typeof data === "string" ? data : JSON.stringify(data);
      const size = new Blob([responseText]).size;

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data,
        timing,
        size,
      });

      toast({
        title: "Request completed",
        description: `${response.status} ${response.statusText} • ${timing}ms`,
      });

    } catch (error) {
      const timing = Date.now() - startTime;
      console.error("Request failed:", error);
      
      setResponse({
        status: 0,
        statusText: "Network Error",
        headers: {},
        data: {
          error: "Failed to fetch",
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: "This could be due to CORS restrictions, network issues, or invalid URL."
        },
        timing,
        size: 0,
      });

      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onSelectRequest={handleSelectRequest} />
        
        <div className="flex-1 flex flex-col p-6 gap-6 overflow-auto custom-scrollbar">
          <RequestBuilder onSendRequest={handleSendRequest} loading={loading} />
          <ResponseViewer response={response} loading={loading} />
        </div>
      </div>
    </div>
  );
}