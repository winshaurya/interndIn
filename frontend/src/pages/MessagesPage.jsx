import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Users } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import DataState from "@/components/common/DataState";

export default function MessagesPage() {
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's connections
  const { data: connectionsResponse, isLoading: connectionsLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: () => apiClient.getConnections(),
  });

  // Get messages for selected connection
  const { data: messagesResponse, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", selectedConnection?.id],
    queryFn: () => selectedConnection ? apiClient.getConversation(selectedConnection.id) : null,
    enabled: !!selectedConnection,
  });

  const connections = connectionsResponse?.data?.data || [];
  const messages = messagesResponse?.data?.data || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data) => apiClient.sendMessage(data.receiver_id, data.content),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries(["messages", selectedConnection?.id]);
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || !selectedConnection) return;

    sendMessageMutation.mutate({
      receiver_id: selectedConnection.otherUser.id,
      content: message.trim(),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (connectionsLoading) {
    return <DataState state="loading" message="Loading conversations..." />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Connections List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {connections.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No connections yet</p>
                <p className="text-sm">Connect with others to start messaging</p>
              </div>
            ) : (
              <div className="space-y-1">
                {connections.map((connection) => (
                  <button
                    key={connection.id}
                    onClick={() => setSelectedConnection(connection)}
                    className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                      selectedConnection?.id === connection.id ? "bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {connection.otherUser.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{connection.otherUser.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {connection.otherUser.role === "student" ? "Student" : "Alumni"}
                        </p>
                      </div>
                      {connection.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {connection.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="lg:col-span-2">
        {selectedConnection ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedConnection.otherUser.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedConnection.otherUser.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedConnection.otherUser.role === "student" ? "Student" : "Alumni"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[400px] p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <DataState state="loading" message="Loading messages..." />
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === selectedConnection.otherUser.id ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            msg.sender_id === selectedConnection.otherUser.id
                              ? "bg-muted"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a connection from the list to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}