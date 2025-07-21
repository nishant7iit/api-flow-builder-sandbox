import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  timing: number;
  size: number;
}

interface ResponseViewerProps {
  response: ResponseData | null;
  loading: boolean;
}

export function ResponseViewer({ response, loading }: ResponseViewerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("body");

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "status-success";
    if (status >= 400 && status < 500) return "status-error";
    if (status >= 500) return "status-error";
    return "status-warning";
  };

  const formatJSON = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Response data has been copied.",
    });
  };

  const downloadResponse = () => {
    if (!response) return;
    
    const blob = new Blob([formatJSON(response.data)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `api-response-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="gradient-card rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse-glow p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Sending request...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="gradient-card rounded-lg p-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-lg font-medium">Ready to send your first request?</p>
            <p className="text-sm">Enter a URL above and click Send to get started.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-card rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge className={getStatusColor(response.status)}>
            {response.status} {response.statusText}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {response.timing}ms
          </div>
          <div className="text-sm text-muted-foreground">
            {(response.size / 1024).toFixed(2)} KB
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(formatJSON(response.data))}
            className="gap-2"
          >
            <Copy className="h-3 w-3" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadResponse}
            className="gap-2"
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="body">Response Body</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="space-y-2">
          <div className="bg-[hsl(var(--code-bg))] border border-[hsl(var(--code-border))] rounded-lg p-4 overflow-auto max-h-96 custom-scrollbar">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
              {formatJSON(response.data)}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="headers" className="space-y-2">
          <div className="bg-[hsl(var(--code-bg))] border border-[hsl(var(--code-border))] rounded-lg p-4 overflow-auto max-h-96 custom-scrollbar">
            <div className="space-y-2">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="flex text-sm">
                  <span className="text-blue-400 font-mono min-w-40">{key}:</span>
                  <span className="text-green-400 font-mono ml-2">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="raw" className="space-y-2">
          <div className="bg-[hsl(var(--code-bg))] border border-[hsl(var(--code-border))] rounded-lg p-4 overflow-auto max-h-96 custom-scrollbar">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
              {typeof response.data === 'string' ? response.data : formatJSON(response.data)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}