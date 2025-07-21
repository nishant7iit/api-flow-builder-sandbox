import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Folder, 
  FolderOpen, 
  Plus, 
  Search, 
  History, 
  Globe, 
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface Request {
  id: string;
  name: string;
  method: string;
  url: string;
  timestamp?: Date;
}

interface Collection {
  id: string;
  name: string;
  requests: Request[];
  expanded: boolean;
}

const mockCollections: Collection[] = [
  {
    id: "1",
    name: "JSONPlaceholder API",
    expanded: true,
    requests: [
      { id: "1", name: "Get all posts", method: "GET", url: "https://jsonplaceholder.typicode.com/posts" },
      { id: "2", name: "Get post by ID", method: "GET", url: "https://jsonplaceholder.typicode.com/posts/1" },
      { id: "3", name: "Create new post", method: "POST", url: "https://jsonplaceholder.typicode.com/posts" },
    ]
  },
  {
    id: "2", 
    name: "User Management",
    expanded: false,
    requests: [
      { id: "4", name: "Get users", method: "GET", url: "https://jsonplaceholder.typicode.com/users" },
      { id: "5", name: "Update user", method: "PUT", url: "https://jsonplaceholder.typicode.com/users/1" },
    ]
  }
];

const recentRequests: Request[] = [
  { id: "r1", name: "Get posts", method: "GET", url: "https://jsonplaceholder.typicode.com/posts", timestamp: new Date() },
  { id: "r2", name: "Get users", method: "GET", url: "https://jsonplaceholder.typicode.com/users", timestamp: new Date(Date.now() - 3600000) },
];

interface SidebarProps {
  onSelectRequest: (request: Request) => void;
}

export function Sidebar({ onSelectRequest }: SidebarProps) {
  const [collections, setCollections] = useState(mockCollections);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"collections" | "history" | "environments">("collections");

  const toggleCollection = (id: string) => {
    setCollections(prev => 
      prev.map(col => 
        col.id === id ? { ...col, expanded: !col.expanded } : col
      )
    );
  };

  const getMethodClass = (method: string) => {
    const classes = {
      GET: "method-get",
      POST: "method-post", 
      PUT: "method-put",
      PATCH: "method-patch",
      DELETE: "method-delete"
    };
    return classes[method as keyof typeof classes] || "method-get";
  };

  const filteredCollections = collections.map(collection => ({
    ...collection,
    requests: collection.requests.filter(req => 
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(collection => collection.requests.length > 0 || searchQuery === "");

  return (
    <div className="w-80 border-r border-border gradient-card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-1 mb-3">
          <Button
            variant={activeTab === "collections" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("collections")}
            className="flex-1 gap-2"
          >
            <Folder className="h-4 w-4" />
            Collections
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("history")}
            className="flex-1 gap-2"
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-2">
          {activeTab === "collections" && (
            <div className="space-y-2">
              {filteredCollections.map((collection) => (
                <Collapsible
                  key={collection.id}
                  open={collection.expanded}
                  onOpenChange={() => toggleCollection(collection.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 h-8 text-sm font-medium"
                    >
                      {collection.expanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {collection.expanded ? (
                        <FolderOpen className="h-4 w-4" />
                      ) : (
                        <Folder className="h-4 w-4" />
                      )}
                      {collection.name}
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {collection.requests.length}
                      </Badge>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-6 mt-1">
                    {collection.requests.map((request) => (
                      <Button
                        key={request.id}
                        variant="ghost"
                        onClick={() => onSelectRequest(request)}
                        className="w-full justify-start gap-2 h-8 text-sm transition-smooth hover:bg-muted/50"
                      >
                        <Badge className={`${getMethodClass(request.method)} text-xs px-2 py-0`}>
                          {request.method}
                        </Badge>
                        <span className="truncate">{request.name}</span>
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}

              <Button variant="outline" className="w-full gap-2 h-8 text-sm">
                <Plus className="h-4 w-4" />
                New Collection
              </Button>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-1">
              {recentRequests.map((request) => (
                <Button
                  key={request.id}
                  variant="ghost"
                  onClick={() => onSelectRequest(request)}
                  className="w-full justify-start gap-2 h-8 text-sm transition-smooth hover:bg-muted/50"
                >
                  <Badge className={`${getMethodClass(request.method)} text-xs px-2 py-0`}>
                    {request.method}
                  </Badge>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="truncate text-xs">{request.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {request.timestamp?.toLocaleTimeString()}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <Globe className="h-4 w-4" />
            Environment
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}