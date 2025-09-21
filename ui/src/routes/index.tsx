import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: async () => {
    throw redirect({ to: "/generate-tests" });
  },
});

function RouteComponent() {
  return <div>Hello "/"!</div>;
}
