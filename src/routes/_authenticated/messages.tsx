import { ChatContent } from "@/components/chat/chatContent";
import { ChatHead } from "@/components/chat/chatHead";
import { ChatList } from "@/components/chat/chatList";
import { ChatSocketProvider } from "@/components/chat/context/chatSocketContext";
import { chatParamsSchema } from "@/components/chat/schemas/chat-params.schema";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/messages")({
  component: RouteComponent,
  validateSearch: chatParamsSchema,
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const { search } = Route.useLoaderDeps();
  const has_selected_chat = search ? Boolean(search.chat_id) : false;
  const block_styles = "flex flex-col gap-4";

  return (
    <ChatSocketProvider>
      <Card size="sm" className="container mx-auto">
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[23rem_auto_minmax(0,1fr)]">
            <div
              className={cn(
                block_styles,
                has_selected_chat ? "hidden lg:flex" : "flex",
              )}
            >
              <div>
                <ChatHead />
              </div>
              <Separator />
              <ChatList />
            </div>

            <Separator orientation="vertical" className="hidden lg:block" />

            <div
              className={cn(
                "min-h-[70vh]",
                block_styles,
                has_selected_chat ? "flex" : "hidden lg:flex",
              )}
            >
              <ChatContent />
            </div>
          </div>
        </CardContent>
      </Card>
    </ChatSocketProvider>
  );
}
